import bearer from "@elysiajs/bearer";
import jwt from "@elysiajs/jwt";
import { Elysia, t } from "elysia";
import db from "../db/init";

interface JWTPayload {
  id: string;
  username?: string;
}

const SECRET = Bun.env.AUTH_SECRET_KEY ?? "dev-secret";

/**
 * Reaction plugin
 * Prefix: /messages
 * - POST   /messages/:id/reactions     -> add reaction (body: { emoji })
 * - GET    /messages/:id/reactions     -> list reactions
 * - DELETE /messages/:id/reactions/:emoji -> remove reaction by emoji
 */
export const reaction = new Elysia({ prefix: "/messages" })
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
    "/:id/reactions",
    async ({ params, body, userId, set }) => {
      try {
        const messageId = params.id;
        const emoji = (body as { emoji: string }).emoji?.trim();
        if (!emoji) {
          set.status = 400;
          return { error: "Emoji is required" };
        }

        // 1) Ensure message exists (and get roomId)
        const message = await db.message.findUnique({
          where: { id: messageId },
          select: { id: true, roomId: true, deleted: true },
        });
        if (!message || message.deleted) {
          set.status = 404;
          return { error: "Message not found" };
        }

        // 2) Ensure user is a member of the room
        const membership = await db.membership.findUnique({
          where: { userId_roomId: { userId, roomId: message.roomId } },
          select: { userId: true },
        });
        if (!membership) {
          set.status = 403;
          return { error: "You are not a member of this room" };
        }

        // 3) Create reaction & increment reactionsCount in a transaction
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

            // increment counter
            await tx.message.update({
              where: { id: messageId },
              data: { reactionsCount: { increment: 1 } },
              select: { id: true },
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
          // Prisma unique constraint for reaction (messageId+userId+emoji)
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
      params: t.Object({ id: t.String() }),
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
    "/:id/reactions",
    async ({ params, userId, set }) => {
      try {
        const messageId = params.id;

        // 1) Ensure message exists and get roomId
        const message = await db.message.findUnique({
          where: { id: messageId },
          select: { id: true, roomId: true, deleted: true },
        });
        if (!message || message.deleted) {
          set.status = 404;
          return { error: "Message not found" };
        }

        // 2) Ensure user is a member of the room
        const membership = await db.membership.findUnique({
          where: { userId_roomId: { userId, roomId: message.roomId } },
          select: { userId: true },
        });
        if (!membership) {
          set.status = 403;
          return { error: "You are not a member of this room" };
        }

        // 3) Fetch reactions (aggregate by emoji optional; here we return each reaction with user)
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
      params: t.Object({ id: t.String() }),
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
    "/:id/reactions/:emoji",
    async ({ params, userId, set }) => {
      try {
        const messageId = params.id;
        const emoji = decodeURIComponent(params.emoji).trim();
        if (!emoji) {
          set.status = 400;
          return { error: "Emoji is required" };
        }

        // 1) Ensure message exists and get roomId
        const message = await db.message.findUnique({
          where: { id: messageId },
          select: { id: true, roomId: true, deleted: true },
        });
        if (!message || message.deleted) {
          set.status = 404;
          return { error: "Message not found" };
        }

        // 2) Ensure user is a member of the room
        const membership = await db.membership.findUnique({
          where: { userId_roomId: { userId, roomId: message.roomId } },
          select: { userId: true },
        });
        if (!membership) {
          set.status = 403;
          return { error: "You are not a member of this room" };
        }

        // 3) Delete reaction + decrement counter in a transaction
        const deleted = await db.$transaction(async (tx) => {
          // Delete reaction matching composite unique key
          const delRes = await tx.reaction.deleteMany({
            where: { messageId, userId, emoji },
          });

          if (delRes.count === 0) return 0;

          // decrement reactionsCount but ensure non-negative
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
      params: t.Object({ id: t.String(), emoji: t.String() }),
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
