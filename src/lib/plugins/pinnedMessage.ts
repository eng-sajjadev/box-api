import bearer from "@elysiajs/bearer";
import jwt from "@elysiajs/jwt";
import { Elysia, t } from "elysia";
import db from "../db/init";
import { MemberRole } from "../../generated/prisma";

interface JWTPayload {
  id: string;
  username?: string;
}
const SECRET = process.env.AUTH_SECRET_KEY ?? "dev-secret";

export const pinnedMessage = new Elysia({ prefix: "/pinned" })
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

  /* Pin a message (only OWNER or ADMIN of the room) */
  .post(
    "/rooms/:roomId/messages/:messageId/pin",
    async ({ params, userId, body, set }) => {
      try {
        const { roomId, messageId } = params;
        // validate message exists and is in room
        const msg = await db.message.findUnique({
          where: { id: messageId },
          select: { id: true, roomId: true, deleted: true },
        });
        if (!msg || msg.deleted || msg.roomId !== roomId) {
          set.status = 404;
          return { error: "Message not found in room" };
        }

        // check membership & role
        const membership = await db.membership.findUnique({
          where: { userId_roomId: { userId, roomId } },
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
          return { error: "Insufficient permissions to pin" };
        }

        // prevent duplicate pins: use createMany with skipDuplicates or check first
        const existing = await db.pinnedMessage.findFirst({
          where: { messageId, roomId },
          select: { id: true },
        });
        if (existing) {
          set.status = 409;
          return { error: "Message already pinned" };
        }

        const pinned = await db.pinnedMessage.create({
          data: {
            messageId,
            roomId,
            pinnedById: userId,
            pinnedAt: new Date(),
            note: (body as any)?.note ?? null,
          },
          select: {
            id: true,
            messageId: true,
            roomId: true,
            pinnedById: true,
            pinnedAt: true,
            note: true,
          },
        });

        return {
          success: true,
          data: {
            id: pinned.id,
            messageId: pinned.messageId,
            roomId: pinned.roomId,
            pinnedById: pinned.pinnedById,
            pinnedAt: pinned.pinnedAt.toISOString(),
            note: pinned.note ?? undefined,
          },
        };
      } catch (err: any) {
        console.error("Pin message error:", err);
        set.status = 500;
        return { error: "Failed to pin message" };
      }
    },
    {
      params: t.Object({ roomId: t.String(), messageId: t.String() }),
      body: t.Partial(t.Object({ note: t.String() })),
      response: {
        200: t.Object({
          success: t.Boolean(),
          data: t.Object({
            id: t.String(),
            messageId: t.String(),
            roomId: t.String(),
            pinnedById: t.String(),
            pinnedAt: t.String(),
            note: t.Optional(t.String()),
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

  /* Unpin a message (owner/admin) */
  .delete(
    "/rooms/:roomId/messages/:messageId/pin",
    async ({ params, userId, set }) => {
      try {
        const { roomId, messageId } = params;

        const membership = await db.membership.findUnique({
          where: { userId_roomId: { userId, roomId } },
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
          return { error: "Insufficient permissions to unpin" };
        }

        const del = await db.pinnedMessage.deleteMany({
          where: { messageId, roomId },
        });

        if (del.count === 0) {
          set.status = 404;
          return { error: "Pinned message not found" };
        }

        return { success: true };
      } catch (err: any) {
        console.error("Unpin message error:", err);
        set.status = 500;
        return { error: "Failed to unpin message" };
      }
    },
    {
      params: t.Object({ roomId: t.String(), messageId: t.String() }),
      response: {
        200: t.Object({ success: t.Boolean() }),
        401: t.Object({ error: t.String() }),
        403: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
      },
    }
  )

  /* List pinned messages for a room (members only) */
  .get(
    "/rooms/:roomId",
    async ({ params, userId, set }) => {
      try {
        const { roomId } = params;

        const membership = await db.membership.findUnique({
          where: { userId_roomId: { userId, roomId } },
          select: { userId: true },
        });
        if (!membership) {
          set.status = 403;
          return { error: "Not a member of the room" };
        }

        const pins = await db.pinnedMessage.findMany({
          where: { roomId },
          orderBy: { pinnedAt: "desc" },
          select: {
            id: true,
            messageId: true,
            pinnedById: true,
            pinnedAt: true,
            note: true,
            message: {
              select: {
                id: true,
                senderId: true,
                createdAt: true,
                deleted: true,
              },
            },
          },
        });

        return {
          success: true,
          data: pins.map((p) => ({
            id: p.id,
            messageId: p.messageId,
            pinnedById: p.pinnedById,
            pinnedAt: p.pinnedAt.toISOString(),
            note: p.note ?? undefined,
            message: p.message
              ? {
                  id: p.message.id,
                  senderId: p.message.senderId,
                  createdAt: p.message.createdAt.toISOString(),
                  deleted: p.message.deleted ?? undefined,
                }
              : undefined,
          })),
        };
      } catch (err: any) {
        console.error("List pins error:", err);
        set.status = 500;
        return { error: "Failed to list pinned messages" };
      }
    },
    {
      params: t.Object({ roomId: t.String() }),
      response: {
        200: t.Object({
          success: t.Boolean(),
          data: t.Array(
            t.Object({
              id: t.String(),
              messageId: t.String(),
              pinnedById: t.String(),
              pinnedAt: t.String(),
              note: t.Optional(t.String()),
              message: t.Optional(
                t.Object({
                  id: t.String(),
                  senderId: t.String(),
                  createdAt: t.String(),
                  deleted: t.Optional(t.Boolean()),
                })
              ),
            })
          ),
        }),
        401: t.Object({ error: t.String() }),
        403: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
      },
    }
  );

export default pinnedMessage;
