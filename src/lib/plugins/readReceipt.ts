import bearer from "@elysiajs/bearer";
import jwt from "@elysiajs/jwt";
import { Elysia, t } from "elysia";
import db from "../db/init";

interface JWTPayload {
  id: string;
  username?: string;
}
const SECRET = process.env.AUTH_SECRET_KEY ?? "dev-secret";

export const readReceipt = new Elysia({ prefix: "/read" })
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

  /* Mark messages as read in a room (bulk) */
  .post(
    "/rooms/:roomId/mark",
    async ({ params, body, userId, set }) => {
      try {
        const { roomId } = params;
        const messageIds = Array.isArray((body as any).messageIds)
          ? (body as any).messageIds
          : [];

        if (!Array.isArray(messageIds) || messageIds.length === 0) {
          set.status = 400;
          return { error: "messageIds array required" };
        }

        // ensure user is member
        const membership = await db.membership.findUnique({
          where: { userId_roomId: { userId, roomId } },
          select: { id: true },
        });
        if (!membership) {
          set.status = 403;
          return { error: "Not a member of the room" };
        }

        // validate messages exist and belong to room
        const validMessages = await db.message.findMany({
          where: { id: { in: messageIds }, roomId, deleted: false },
          select: { id: true, createdAt: true },
        });
        const validIds = validMessages.map((m) => m.id);
        if (validIds.length === 0) {
          set.status = 400;
          return { error: "No valid messages to mark" };
        }

        // createMany with skipDuplicates (fast) — create receipts
        const now = new Date();
        await db.readReceipt.createMany({
          data: validIds.map((id) => ({ messageId: id, userId, readAt: now })),
          skipDuplicates: true,
        });

        // optionally, update membership.lastReadAt to the latest createdAt among marked messages
        const latest = validMessages.reduce((a, b) =>
          a.createdAt > b.createdAt ? a : b
        ).createdAt;
        await db.membership.update({
          where: { userId_roomId: { userId, roomId } },
          data: { lastReadAt: latest },
        });

        return { success: true };
      } catch (err: any) {
        console.error("Mark read error:", err);
        set.status = 500;
        return { error: "Failed to mark read" };
      }
    },
    {
      params: t.Object({ roomId: t.String() }),
      body: t.Object({ messageIds: t.Array(t.String()) }),
      response: {
        200: t.Object({ success: t.Boolean() }),
        400: t.Object({ error: t.String() }),
        401: t.Object({ error: t.String() }),
        403: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
      },
    }
  )

  /* Get readers of a specific message */
  .get(
    "/messages/:messageId/readers",
    async ({ params, userId, set }) => {
      try {
        const { messageId } = params;
        const msg = await db.message.findUnique({
          where: { id: messageId },
          select: { id: true, roomId: true, deleted: true },
        });
        if (!msg || msg.deleted) {
          set.status = 404;
          return { error: "Message not found" };
        }

        // ensure requester is member
        const membership = await db.membership.findUnique({
          where: { userId_roomId: { userId, roomId: msg.roomId } },
          select: { id: true },
        });
        if (!membership) {
          set.status = 403;
          return { error: "Not a member of the room" };
        }

        const readers = await db.readReceipt.findMany({
          where: { messageId },
          orderBy: { readAt: "asc" },
          select: {
            userId: true,
            readAt: true,
            user: { select: { id: true, username: true, avatar: true } },
          },
        });

        return {
          success: true,
          data: readers.map((r) => ({
            userId: r.userId,
            readAt: r.readAt.toISOString(),
            user: {
              id: r.user.id,
              username: r.user.username,
              avatar: r.user.avatar ?? undefined,
            },
          })),
        };
      } catch (err: any) {
        console.error("Get readers error:", err);
        set.status = 500;
        return { error: "Failed to get readers" };
      }
    },
    {
      params: t.Object({ messageId: t.String() }),
      response: {
        200: t.Object({
          success: t.Boolean(),
          data: t.Array(
            t.Object({
              userId: t.String(),
              readAt: t.String(),
              user: t.Object({
                id: t.String(),
                username: t.String(),
                avatar: t.Optional(t.String()),
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

  /* Get current user's lastReadAt for a room */
  .get(
    "/rooms/:roomId/last",
    async ({ params, userId, set }) => {
      try {
        const { roomId } = params;
        const membership = await db.membership.findUnique({
          where: { userId_roomId: { userId, roomId } },
          select: { lastReadAt: true },
        });
        if (!membership) {
          set.status = 403;
          return { error: "Not a member of the room" };
        }
        return {
          success: true,
          data: {
            lastReadAt: membership.lastReadAt?.toISOString() ?? undefined,
          },
        };
      } catch (err: any) {
        console.error("Get lastRead error:", err);
        set.status = 500;
        return { error: "Failed to get lastRead" };
      }
    },
    {
      params: t.Object({ roomId: t.String() }),
      response: {
        200: t.Object({
          success: t.Boolean(),
          data: t.Object({ lastReadAt: t.Optional(t.String()) }),
        }),
        401: t.Object({ error: t.String() }),
        403: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
      },
    }
  );

export default readReceipt;
