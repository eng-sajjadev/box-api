import bearer from "@elysiajs/bearer";
import jwt from "@elysiajs/jwt";
import { Elysia, t } from "elysia";
import db from "../db/init";
import { MessageStatus } from "../../generated/prisma";

interface JWTPayload {
  id: string;
  username?: string;
}

const SECRET = Bun.env.AUTH_SECRET_KEY ?? "dev-secret";

export const message = new Elysia({ prefix: "/messages" })
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

  /* -------------------- Create message -------------------- */
  .post(
    "/:roomId",
    async ({ params, body, userId, set }) => {
      try {
        const roomId = params.roomId;
        const {
          content = null,
          replyToId = null,
          receiverId = null,
        } = body as {
          content?: string | null;
          replyToId?: string | null;
          receiverId?: string | null;
        };

        // membership check: user must be member of room to post
        const membership = await db.membership.findUnique({
          where: { userId_roomId: { userId, roomId } },
          select: { userId: true },
        });
        if (!membership) {
          set.status = 403;
          return { error: "You are not a member of this room" };
        }

        // If replying, ensure replyTo message exists in same room (optional)
        if (replyToId) {
          const parent = await db.message.findUnique({
            where: { id: replyToId },
            select: { roomId: true },
          });
          if (!parent || parent.roomId !== roomId) {
            set.status = 400;
            return { error: "Invalid replyToId" };
          }
        }

        // Transaction: create message, optional content, increment room counters
        const now = new Date();
        const result = await db.$transaction(async (tx) => {
          const created = await tx.message.create({
            data: {
              roomId,
              senderId: userId,
              receiverId,
              replyToId,
              createdAt: now,
              status: MessageStatus.SENT,
            },
            select: {
              id: true,
              roomId: true,
              senderId: true,
              receiverId: true,
              replyToId: true,
              createdAt: true,
              status: true,
              reactionsCount: true,
            },
          });

          if (content !== null && content !== undefined) {
            await tx.messageContent.create({
              data: {
                messageId: created.id,
                body: content,
              },
            });
          }

          // increment messageCount and update lastMessageAt atomically
          await tx.room.update({
            where: { id: roomId },
            data: {
              messageCount: { increment: 1 },
              lastMessageAt: now,
            },
            select: { id: true },
          });

          return created;
        });

        // Fetch message content & sender info to return
        const messageWithRelations = await db.message.findUnique({
          where: { id: result.id },
          select: {
            id: true,
            roomId: true,
            senderId: true,
            receiverId: true,
            replyToId: true,
            createdAt: true,
            updatedAt: true,
            status: true,
            deleted: true,
            deletedAt: true,
            reactionsCount: true,
            content: {
              select: { body: true, edited: true, editedAt: true },
            },
            sender: {
              select: { id: true, username: true, avatar: true, status: true },
            },
          },
        });

        return {
          success: true,
          data: {
            id: messageWithRelations!.id,
            roomId: messageWithRelations!.roomId,
            sender: {
              id: messageWithRelations!.sender!.id,
              username: messageWithRelations!.sender!.username,
              avatar: messageWithRelations!.sender!.avatar ?? undefined,
              status: messageWithRelations!.sender!.status ?? undefined,
            },
            receiverId: messageWithRelations!.receiverId ?? undefined,
            replyToId: messageWithRelations!.replyToId ?? undefined,
            content: messageWithRelations!.content?.body ?? undefined,
            contentEdited: messageWithRelations!.content?.edited ?? undefined,
            createdAt: messageWithRelations!.createdAt.toISOString(),
            status: messageWithRelations!.status,
            reactionsCount: messageWithRelations!.reactionsCount,
          },
        };
      } catch (err: any) {
        console.error("Create message error:", err);
        set.status = 500;
        return { error: "Failed to create message" };
      }
    },
    {
      params: t.Object({ roomId: t.String() }),
      body: t.Object({
        content: t.Optional(t.String()),
        replyToId: t.Optional(t.String()),
        receiverId: t.Optional(t.String()),
      }),
      response: {
        200: t.Object({
          success: t.Boolean(),
          data: t.Object({
            id: t.String(),
            roomId: t.String(),
            sender: t.Object({
              id: t.String(),
              username: t.String(),
              avatar: t.Optional(t.String()),
              status: t.Optional(t.String()),
            }),
            receiverId: t.Optional(t.String()),
            replyToId: t.Optional(t.String()),
            content: t.Optional(t.String()),
            contentEdited: t.Optional(t.Boolean()),
            createdAt: t.String(),
            status: t.String(),
            reactionsCount: t.Number(),
          }),
        }),
        400: t.Object({ error: t.String() }),
        401: t.Object({ error: t.String() }),
        403: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
      },
    }
  )

  /* -------------------- List messages (cursor pagination by createdAt) -------------------- */
  .get(
    "/:roomId",
    async ({ params, userId, query, set }) => {
      try {
        const roomId = params.roomId;
        // parse query params
        const limitRaw = Number(query.limit ?? 50);
        const limit = Math.min(
          Math.max(1, isNaN(limitRaw) ? 50 : limitRaw),
          100
        );
        const before = query.before ?? null; // ISO date string or null

        // ensure membership
        const membership = await db.membership.findUnique({
          where: { userId_roomId: { userId, roomId } },
          select: { userId: true },
        });
        if (!membership) {
          set.status = 403;
          return { error: "You are not a member of this room" };
        }

        const whereClause: any = { roomId, deleted: false };
        if (before) {
          const beforeDate = new Date(before);
          if (isNaN(beforeDate.getTime())) {
            set.status = 400;
            return { error: "Invalid 'before' cursor" };
          }
          // fetch messages earlier than 'before'
          whereClause.createdAt = { lt: beforeDate };
        }

        const messages = await db.message.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          take: limit,
          select: {
            id: true,
            roomId: true,
            senderId: true,
            receiverId: true,
            replyToId: true,
            createdAt: true,
            updatedAt: true,
            status: true,
            reactionsCount: true,
            content: { select: { body: true, edited: true, editedAt: true } },
            sender: {
              select: { id: true, username: true, avatar: true, status: true },
            },
          },
        });

        return {
          success: true,
          data: messages.map((m) => ({
            id: m.id,
            roomId: m.roomId,
            sender: {
              id: m.sender!.id,
              username: m.sender!.username,
              avatar: m.sender!.avatar ?? undefined,
              status: m.sender!.status ?? undefined,
            },
            receiverId: m.receiverId ?? undefined,
            replyToId: m.replyToId ?? undefined,
            content: m.content?.body ?? undefined,
            contentEdited: m.content?.edited ?? undefined,
            createdAt: m.createdAt.toISOString(),
            updatedAt: m.updatedAt?.toISOString() ?? undefined,
            status: m.status,
            reactionsCount: m.reactionsCount,
          })),
        };
      } catch (err: any) {
        console.error("List messages error:", err);
        set.status = 500;
        return { error: "Failed to list messages" };
      }
    },
    {
      params: t.Object({ roomId: t.String() }),
      // query params are typed at runtime by Elysia via `query`, not required here
      response: {
        200: t.Object({
          success: t.Boolean(),
          data: t.Array(
            t.Object({
              id: t.String(),
              roomId: t.String(),
              sender: t.Object({
                id: t.String(),
                username: t.String(),
                avatar: t.Optional(t.String()),
                status: t.Optional(t.String()),
              }),
              receiverId: t.Optional(t.String()),
              replyToId: t.Optional(t.String()),
              content: t.Optional(t.String()),
              contentEdited: t.Optional(t.Boolean()),
              createdAt: t.String(),
              updatedAt: t.Optional(t.String()),
              status: t.String(),
              reactionsCount: t.Number(),
            })
          ),
        }),
        400: t.Object({ error: t.String() }),
        401: t.Object({ error: t.String() }),
        403: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
      },
    }
  )

  /* -------------------- Edit message -------------------- */
  .patch(
    "/:id",
    async ({ params, body, userId, set }) => {
      try {
        // ensure message exists and fetch sender + room
        const msg = await db.message.findUnique({
          where: { id: params.id },
          select: { id: true, senderId: true, roomId: true, deleted: true },
        });
        if (!msg || msg.deleted) {
          set.status = 404;
          return { error: "Message not found" };
        }

        if (msg.senderId !== userId) {
          set.status = 403;
          return { error: "Only the sender can edit the message" };
        }

        const { content } = body as { content: string };

        // update content and mark edited
        const now = new Date();
        await db.$transaction(async (tx) => {
          // upsert content row: if absent, create; else update
          const existingContent = await tx.messageContent.findUnique({
            where: { messageId: msg.id },
            select: { messageId: true },
          });

          if (!existingContent) {
            await tx.messageContent.create({
              data: {
                messageId: msg.id,
                body: content,
                edited: true,
                editedAt: now,
              },
            });
          } else {
            await tx.messageContent.update({
              where: { messageId: msg.id },
              data: { body: content, edited: true, editedAt: now },
            });
          }

          // optionally update message.updatedAt
          await tx.message.update({
            where: { id: msg.id },
            data: { updatedAt: now },
          });
        });

        // return updated message minimal
        const updated = await db.message.findUnique({
          where: { id: msg.id },
          select: {
            id: true,
            content: { select: { body: true, edited: true, editedAt: true } },
            updatedAt: true,
          },
        });

        return {
          success: true,
          data: {
            id: updated!.id,
            content: updated!.content?.body ?? undefined,
            contentEdited: updated!.content?.edited ?? undefined,
            editedAt: updated!.content?.editedAt?.toISOString() ?? undefined,
            updatedAt: updated!.updatedAt.toISOString(),
          },
        };
      } catch (err: any) {
        console.error("Edit message error:", err);
        set.status = 500;
        return { error: "Failed to edit message" };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({ content: t.String({ minLength: 1 }) }),
      response: {
        200: t.Object({
          success: t.Boolean(),
          data: t.Object({
            id: t.String(),
            content: t.Optional(t.String()),
            contentEdited: t.Optional(t.Boolean()),
            editedAt: t.Optional(t.String()),
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

  /* -------------------- Delete (soft) message -------------------- */
  .delete(
    "/:id",
    async ({ params, userId, set }) => {
      try {
        const msg = await db.message.findUnique({
          where: { id: params.id },
          select: { id: true, senderId: true, roomId: true, deleted: true },
        });
        if (!msg) {
          set.status = 404;
          return { error: "Message not found" };
        }
        if (msg.deleted) {
          set.status = 404;
          return { error: "Message already deleted" };
        }

        // allow delete by sender or room owner
        if (msg.senderId !== userId) {
          const room = await db.room.findUnique({
            where: { id: msg.roomId },
            select: { ownerId: true },
          });
          if (!room || room.ownerId !== userId) {
            set.status = 403;
            return { error: "Not authorized to delete this message" };
          }
        }

        // soft delete + decrement messageCount
        const now = new Date();
        await db.$transaction(async (tx) => {
          await tx.message.update({
            where: { id: msg.id },
            data: { deleted: true, deletedAt: now },
          });

          // decrement messageCount but avoid negative counts
          await tx.room.updateMany({
            where: { id: msg.roomId, messageCount: { gt: 0 } },
            data: { messageCount: { decrement: 1 } },
          });
        });

        return { success: true };
      } catch (err: any) {
        console.error("Delete message error:", err);
        set.status = 500;
        return { error: "Failed to delete message" };
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

export default message;
