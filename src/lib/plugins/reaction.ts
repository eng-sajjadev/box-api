// src/lib/plugins/reaction-unique.ts
import bearer from "@elysiajs/bearer";
import jwt from "@elysiajs/jwt";
import { Elysia, t } from "elysia";
import db from "../db/init";

interface JWTPayload {
  id: string;
  username?: string;
}

const SECRET = process.env.AUTH_SECRET_KEY ?? "dev-secret";

/**
 * Unique Reaction plugin: uses its own top-level path to avoid route collisions.
 * Prefix: /api/v0.2/reactions
 *
 * POST   /api/v0.2/reactions/messages/:messageId
 * GET    /api/v0.2/reactions/messages/:messageId
 * DELETE /api/v0.2/reactions/messages/:messageId/:emoji
 */
export const reaction = new Elysia({ prefix: "/reactions" })
  .use(bearer())
  .use(jwt({ name: "jwt", secret: SECRET }))
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

  /* -------------------- Add reaction -------------------- */
  .post(
    "/messages/:messageId",
    async ({ params, body, userId, set }) => {
      try {
        const messageId = params.messageId;
        const emoji = (body as { emoji: string }).emoji?.trim();
        if (!emoji) {
          set.status = 400;
          return { error: "Emoji is required" };
        }

        // Ensure message exists and get roomId
        const message = await db.message.findUnique({
          where: { id: messageId },
          select: { id: true, roomId: true, deleted: true },
        });
        if (!message || message.deleted) {
          set.status = 404;
          return { error: "Message not found" };
        }

        // Ensure user is member of room
        const membership = await db.membership.findUnique({
          where: { userId_roomId: { userId, roomId: message.roomId } },
          select: { userId: true },
        });

        if (!membership) {
          set.status = 403;
          return { error: "You are not a member of the room" };
        }

        // Create reaction and increment message.reactionsCount atomically
        try {
          const now = new Date();
          const created = await db.$transaction(async (tx) => {
            const r = await tx.reaction.create({
              data: {
                messageId,
                userId,
                emoji,
                createdAt: now,
              },
              select: {
                id: true,
                emoji: true,
                createdAt: true,
                user: {
                  select: {
                    id: true,
                    username: true,
                    avatar: true,
                    status: true,
                  },
                },
              },
            });

            await tx.message.update({
              where: { id: messageId },
              data: { reactionsCount: { increment: 1 } },
            });

            return r;
          });

          return {
            success: true,
            data: {
              id: created.id,
              emoji: created.emoji,
              createdAt: created.createdAt.toISOString(),
              user: {
                id: created.user.id,
                username: created.user.username,
                avatar: created.user.avatar ?? undefined,
                status: created.user.status ?? undefined,
              },
            },
          };
        } catch (err: any) {
          // Prisma unique constraint (messageId + userId + emoji)
          if (err?.code === "P2002") {
            set.status = 409;
            return { error: "Reaction already exists" };
          }
          throw err;
        }
      } catch (err: any) {
        console.error("Add reaction error:", err);
        set.status = 500;
        return { error: "Failed to add reaction" };
      }
    },
    {
      params: t.Object({ messageId: t.String() }),
      body: t.Object({ emoji: t.String({ minLength: 1 }) }),
      response: {
        200: t.Object({
          success: t.Boolean(),
          data: t.Object({
            id: t.String(),
            emoji: t.String(),
            createdAt: t.String(),
            user: t.Object({
              id: t.String(),
              username: t.String(),
              avatar: t.Optional(t.String()),
              status: t.Optional(t.String()),
            }),
          }),
        }),
        400: t.Object({ error: t.String() }),
        401: t.Object({ error: t.String() }),
        403: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
        409: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
      },
    }
  )

  /* -------------------- List reactions for a message -------------------- */
  .get(
    "/messages/:messageId",
    async ({ params, userId, set }) => {
      try {
        const messageId = params.messageId;

        const message = await db.message.findUnique({
          where: { id: messageId },
          select: { id: true, roomId: true, deleted: true },
        });
        if (!message || message.deleted) {
          set.status = 404;
          return { error: "Message not found" };
        }

        const membership = await db.membership.findUnique({
          where: { userId_roomId: { userId, roomId: message.roomId } },
          select: { userId: true },
        });

        if (!membership) {
          set.status = 403;
          return { error: "You are not a member of the room" };
        }

        const reactions = await db.reaction.findMany({
          where: { messageId },
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            emoji: true,
            createdAt: true,
            user: {
              select: { id: true, username: true, avatar: true, status: true },
            },
          },
        });

        return {
          success: true,
          data: reactions.map((r) => ({
            id: r.id,
            emoji: r.emoji,
            createdAt: r.createdAt.toISOString(),
            user: {
              id: r.user.id,
              username: r.user.username,
              avatar: r.user.avatar ?? undefined,
              status: r.user.status ?? undefined,
            },
          })),
        };
      } catch (err: any) {
        console.error("List reactions error:", err);
        set.status = 500;
        return { error: "Failed to list reactions" };
      }
    },
    {
      params: t.Object({ messageId: t.String() }),
      response: {
        200: t.Object({
          success: t.Boolean(),
          data: t.Array(
            t.Object({
              id: t.String(),
              emoji: t.String(),
              createdAt: t.String(),
              user: t.Object({
                id: t.String(),
                username: t.String(),
                avatar: t.Optional(t.String()),
                status: t.Optional(t.String()),
              }),
            })
          ),
        }),
        401: t.Object({ error: t.String() }),
        403: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
      },
    }
  )

  /* -------------------- Remove reaction -------------------- */
  .delete(
    "/messages/:messageId/:emoji",
    async ({ params, userId, set }) => {
      try {
        const messageId = params.messageId;
        const emoji = decodeURIComponent(params.emoji).trim();
        if (!emoji) {
          set.status = 400;
          return { error: "Emoji is required" };
        }

        const message = await db.message.findUnique({
          where: { id: messageId },
          select: { id: true, roomId: true, deleted: true },
        });
        if (!message || message.deleted) {
          set.status = 404;
          return { error: "Message not found" };
        }

        const membership = await db.membership.findUnique({
          where: { userId_roomId: { userId, roomId: message.roomId } },
          select: { userId: true },
        });

        if (!membership) {
          set.status = 403;
          return { error: "You are not a member of the room" };
        }

        const deleted = await db.$transaction(async (tx) => {
          const delRes = await tx.reaction.deleteMany({
            where: { messageId, userId, emoji },
          });

          if (delRes.count === 0) return 0;

          await tx.message.updateMany({
            where: { id: messageId, reactionsCount: { gt: 0 } },
            data: { reactionsCount: { decrement: 1 } },
          });

          return delRes.count;
        });

        if (deleted === 0) {
          set.status = 404;
          return { error: "Reaction not found" };
        }

        return { success: true };
      } catch (err: any) {
        console.error("Remove reaction error:", err);
        set.status = 500;
        return { error: "Failed to remove reaction" };
      }
    },
    {
      params: t.Object({ messageId: t.String(), emoji: t.String() }),
      response: {
        200: t.Object({ success: t.Boolean() }),
        400: t.Object({ error: t.String() }),
        401: t.Object({ error: t.String() }),
        403: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
      },
    }
  );

export default reaction;
