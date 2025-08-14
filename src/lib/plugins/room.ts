import bearer from "@elysiajs/bearer";
import jwt from "@elysiajs/jwt";
import { Elysia, t } from "elysia";
import db from "../db/init";
import { MemberRole } from "../../generated/prisma";

interface JWTPayload {
  id: string;
  username?: string;
}

const SECRET = Bun.env.AUTH_SECRET_KEY ?? "dev-secret";

export const room = new Elysia({ prefix: "/rooms" })
  .use(bearer())
  .use(jwt({ name: "jwt", secret: SECRET }))
  // derive userId into context (typed)
  .derive<{ userId: string }>(async ({ jwt, bearer, set }) => {
    if (!bearer) {
      set.status = 401;
      throw new Error("Bearer token required");
    }
    const payload = (await jwt.verify(bearer)) as JWTPayload | false;
    if (!payload) {
      set.status = 401;
      throw new Error("Invalid token");
    }
    return { userId: payload.id };
  })

  /* -------------------- Create room -------------------- */
  .post(
    "/",
    async ({ body, userId, set }) => {
      try {
        const {
          name = null,
          description = null,
          type,
          avatar = null,
          memberIds = [],
        } = body as {
          name?: string | null;
          description?: string | null;
          type: "PRIVATE" | "GROUP" | "CHANNEL";
          avatar?: string | null;
          memberIds?: string[] | undefined;
        };

        // Normalize memberIds: ensure array, remove duplicates, and exclude the creator
        const rawMemberIds = Array.isArray(memberIds) ? memberIds : [];
        const uniqueMemberIds = Array.from(
          new Set(rawMemberIds.filter((id) => id !== userId))
        );

        // PRIVATE room must have exactly one other member
        if (type === "PRIVATE") {
          if (uniqueMemberIds.length !== 1) {
            set.status = 400;
            return { error: "PRIVATE room must have exactly one other member" };
          }
        }

        // Validate that provided memberIds exist (batch)
        if (uniqueMemberIds.length > 0) {
          const foundUsers = await db.user.findMany({
            where: { id: { in: uniqueMemberIds } },
            select: { id: true },
          });
          if (foundUsers.length !== uniqueMemberIds.length) {
            set.status = 404;
            return { error: "One or more memberIds not found" };
          }
        }

        // For PRIVATE rooms: check if a private room already exists between the two users
        if (type === "PRIVATE") {
          const other = uniqueMemberIds[0];
          const existing = await db.room.findFirst({
            where: {
              type: "PRIVATE",
              AND: [
                { members: { some: { userId } } },
                { members: { some: { userId: other } } },
              ],
            },
            select: { id: true },
          });
          if (existing) {
            set.status = 400;
            return { error: "Private room between these users already exists" };
          }
        }

        // Build nested create array for members: creator = OWNER, others = MEMBER
        const membershipCreates = [
          { userId, role: MemberRole.OWNER },
          ...uniqueMemberIds.map((id) => ({
            userId: id,
            role: MemberRole.MEMBER,
          })),
        ];

        // Create room with nested members in one query
        const createdRoom = await db.room.create({
          data: {
            name,
            description,
            type,
            avatar,
            ownerId: type !== "CHANNEL" ? userId : null,
            members: {
              create: membershipCreates,
            },
          },
          // select minimal necessary fields
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            avatar: true,
            ownerId: true,
            createdAt: true,
            members: {
              select: {
                userId: true,
                role: true,
                user: {
                  select: {
                    id: true,
                    username: true,
                    avatar: true,
                    status: true,
                  },
                },
              },
            },
          },
        });

        return {
          success: true,
          data: {
            id: createdRoom.id,
            name: createdRoom.name ?? undefined,
            description: createdRoom.description ?? undefined,
            type: createdRoom.type,
            avatar: createdRoom.avatar ?? undefined,
            ownerId: createdRoom.ownerId ?? undefined,
            createdAt: createdRoom.createdAt.toISOString(),
            members: createdRoom.members.map((m) => ({
              userId: m.userId,
              role: m.role,
              user: {
                id: m.user.id,
                username: m.user.username,
                avatar: m.user.avatar ?? undefined,
                status: m.user.status ?? undefined,
              },
            })),
          },
        };
      } catch (err: any) {
        // Prisma unique constraint or other DB errors can be handled here
        console.error("Create room error:", err);
        set.status = 500;
        return { error: "Failed to create room" };
      }
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        description: t.Optional(t.String()),
        type: t.Enum({
          PRIVATE: "PRIVATE",
          GROUP: "GROUP",
          CHANNEL: "CHANNEL",
        }),
        avatar: t.Optional(t.String({ format: "url" })),
        memberIds: t.Optional(t.Array(t.String())),
      }),
      response: {
        200: t.Object({
          success: t.Boolean(),
          data: t.Object({
            id: t.String(),
            name: t.Optional(t.String()),
            description: t.Optional(t.String()),
            type: t.String(),
            avatar: t.Optional(t.String()),
            ownerId: t.Optional(t.String()),
            createdAt: t.String(),
            members: t.Array(
              t.Object({
                userId: t.String(),
                role: t.String(),
                user: t.Object({
                  id: t.String(),
                  username: t.String(),
                  avatar: t.Optional(t.String()),
                  status: t.Optional(t.String()),
                }),
              })
            ),
          }),
        }),
        400: t.Object({ error: t.String() }),
        401: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
      },
    }
  )

  /* -------------------- Update room -------------------- */
  .patch(
    "/:id",
    async ({ params, body, userId, set }) => {
      try {
        // fetch membership quickly (use compound unique)
        const membership = await db.membership.findUnique({
          where: { userId_roomId: { userId, roomId: params.id } },
          select: { role: true },
        });

        if (!membership) {
          set.status = 403;
          return { error: "Not a member of the room" };
        }

        if (
          membership.role !== MemberRole.OWNER &&
          membership.role !== MemberRole.ADMIN
        ) {
          set.status = 403;
          return { error: "Insufficient permissions" };
        }

        // Update allowed fields (name, description, avatar)
        const updated = await db.room.update({
          where: { id: params.id },
          data: {
            name: body.name ?? undefined,
            description: body.description ?? undefined,
            avatar: body.avatar ?? undefined,
          },
          select: {
            id: true,
            name: true,
            description: true,
            avatar: true,
            updatedAt: true,
          },
        });

        return {
          success: true,
          data: {
            id: updated.id,
            name: updated.name ?? undefined,
            description: updated.description ?? undefined,
            avatar: updated.avatar ?? undefined,
            updatedAt: updated.updatedAt.toISOString(),
          },
        };
      } catch (err: any) {
        console.error("Update room error:", err);
        set.status = 500;
        return { error: "Failed to update room" };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        name: t.Optional(t.String()),
        description: t.Optional(t.String()),
        avatar: t.Optional(t.String({ format: "url" })),
      }),
      response: {
        200: t.Object({
          success: t.Boolean(),
          data: t.Object({
            id: t.String(),
            name: t.Optional(t.String()),
            description: t.Optional(t.String()),
            avatar: t.Optional(t.String()),
            updatedAt: t.String(),
          }),
        }),
        400: t.Object({ error: t.String() }),
        401: t.Object({ error: t.String() }),
        403: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
      },
    }
  )

  /* -------------------- List my rooms -------------------- */
  .get(
    "/",
    async ({ userId }) => {
      const rooms = await db.room.findMany({
        where: { members: { some: { userId } } },
        select: {
          id: true,
          name: true,
          type: true,
          avatar: true,
          ownerId: true,
          lastMessageAt: true,
          createdAt: true,
          members: {
            select: {
              userId: true,
              role: true,
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                  status: true,
                },
              },
            },
          },
        },
        orderBy: { lastMessageAt: "desc" },
      });

      return {
        success: true,
        data: rooms.map((r) => ({
          id: r.id,
          name: r.name ?? undefined,
          type: r.type,
          avatar: r.avatar ?? undefined,
          ownerId: r.ownerId ?? undefined,
          lastMessageAt: r.lastMessageAt?.toISOString() ?? undefined,
          createdAt: r.createdAt.toISOString(),
          members: r.members.map((m) => ({
            userId: m.userId,
            role: m.role,
            user: {
              id: m.user.id,
              username: m.user.username,
              avatar: m.user.avatar ?? undefined,
              status: m.user.status ?? undefined,
            },
          })),
        })),
      };
    },
    {
      response: {
        200: t.Object({
          success: t.Boolean(),
          data: t.Array(
            t.Object({
              id: t.String(),
              name: t.Optional(t.String()),
              type: t.String(),
              avatar: t.Optional(t.String()),
              ownerId: t.Optional(t.String()),
              lastMessageAt: t.Optional(t.String()),
              createdAt: t.String(),
              members: t.Array(
                t.Object({
                  userId: t.String(),
                  role: t.String(),
                  user: t.Object({
                    id: t.String(),
                    username: t.String(),
                    avatar: t.Optional(t.String()),
                    status: t.Optional(t.String()),
                  }),
                })
              ),
            })
          ),
        }),
      },
    }
  )

  /* -------------------- Delete room -------------------- */
  .delete(
    "/:id",
    async ({ params, userId, set }) => {
      try {
        const room = await db.room.findUnique({
          where: { id: params.id },
          select: { id: true, ownerId: true },
        });

        if (!room) {
          set.status = 404;
          return { error: "Room not found" };
        }

        if (room.ownerId !== userId) {
          set.status = 403;
          return { error: "Only owner can delete room" };
        }

        // Delete room (cascades memberships/messages depending on DB schema / FK on delete)
        await db.room.delete({ where: { id: params.id } });

        return { success: true };
      } catch (err: any) {
        console.error("Delete room error:", err);
        set.status = 500;
        return { error: "Failed to delete room" };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      response: {
        200: t.Object({ success: t.Boolean() }),
        401: t.Object({ error: t.String() }),
        403: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
      },
    }
  );

export default room;
