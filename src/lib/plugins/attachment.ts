import bearer from "@elysiajs/bearer";
import jwt from "@elysiajs/jwt";
import { Elysia, t } from "elysia";
import db from "../db/init";
import { AttachmentType } from "../../generated/prisma";

interface JWTPayload {
  id: string;
  username?: string;
}

const SECRET = process.env.AUTH_SECRET_KEY ?? "dev-secret";
// Max allowed attachment size (bytes) — enforce at app level (50 MB default)
const MAX_SIZE_BYTES = Number(
  process.env.MAX_ATTACHMENT_SIZE_BYTES ?? 50 * 1024 * 1024
);

export const attachment = new Elysia({ prefix: "/attachments" })
  .use(bearer())
  .use(jwt({ name: "jwt", secret: SECRET }))
  // inject userId into handlers
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

  /* -------------------- Upload attachment --------------------
     POST /attachments
     body: { messageId, url, type, name?, size? }
  */
  .post(
    "/",
    async ({ body, userId, set }) => {
      try {
        const {
          messageId,
          url,
          type,
          name = null,
          size = null,
        } = body as {
          messageId: string;
          url: string;
          type: AttachmentType | string;
          name?: string | null;
          size?: number | null;
        };

        // Basic validations
        if (!messageId || typeof messageId !== "string") {
          set.status = 400;
          return { error: "messageId is required" };
        }
        if (!url || typeof url !== "string") {
          set.status = 400;
          return { error: "url is required" };
        }
        // trim url and basic URL structure check
        try {
          new URL(url);
        } catch {
          set.status = 400;
          return { error: "Invalid url" };
        }

        // validate type
        const attachmentType = (type as string).toUpperCase() as AttachmentType;
        if (!Object.values(AttachmentType).includes(attachmentType)) {
          set.status = 400;
          return { error: "Invalid attachment type" };
        }

        // validate size
        if (size !== null && typeof size !== "number") {
          set.status = 400;
          return { error: "size must be a number (bytes) or null" };
        }
        if (typeof size === "number" && size > MAX_SIZE_BYTES) {
          set.status = 400;
          return {
            error: `Attachment too large (max ${MAX_SIZE_BYTES} bytes)`,
          };
        }

        // Ensure message exists and fetch roomId
        const message = await db.message.findUnique({
          where: { id: messageId },
          select: { id: true, roomId: true, senderId: true, deleted: true },
        });
        if (!message || message.deleted) {
          set.status = 404;
          return { error: "Message not found" };
        }

        // Ensure user is a member of the room
        const membership = await db.membership.findUnique({
          where: { userId_roomId: { userId, roomId: message.roomId } },
          select: { userId: true },
        });
        if (!membership) {
          set.status = 403;
          return { error: "You are not a member of the room" };
        }

        // Create attachment
        const created = await db.attachment.create({
          data: {
            url,
            type: attachmentType,
            name,
            size,
            messageId,
            userId,
          },
          select: {
            id: true,
            url: true,
            type: true,
            name: true,
            size: true,
            messageId: true,
            userId: true,
            createdAt: true,
          },
        });

        return {
          success: true,
          data: {
            id: created.id,
            url: created.url,
            type: created.type,
            name: created.name ?? undefined,
            size: created.size ?? undefined,
            messageId: created.messageId,
            userId: created.userId,
            createdAt: created.createdAt.toISOString(),
          },
        };
      } catch (err: any) {
        console.error("Upload attachment error:", err);
        set.status = 500;
        return { error: "Failed to upload attachment" };
      }
    },
    {
      body: t.Object({
        messageId: t.String(),
        url: t.String({ format: "url" }),
        type: t.Enum(
          Object.fromEntries(
            Object.values(AttachmentType).map((v) => [v, v])
          ) as Record<string, string>
        ),
        name: t.Optional(t.String({ maxLength: 255 })),
        size: t.Optional(t.Number()),
      }),
      response: {
        200: t.Object({
          success: t.Boolean(),
          data: t.Object({
            id: t.String(),
            url: t.String(),
            type: t.String(),
            name: t.Optional(t.String()),
            size: t.Optional(t.Number()),
            messageId: t.String(),
            userId: t.String(),
            createdAt: t.String(),
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

  /* -------------------- List attachments for a message --------------------
     GET /attachments/message/:messageId
  */
  .get(
    "/message/:messageId",
    async ({ params, userId, set }) => {
      try {
        const messageId = params.messageId;

        // Ensure message exists
        const message = await db.message.findUnique({
          where: { id: messageId },
          select: { id: true, roomId: true, deleted: true },
        });
        if (!message || message.deleted) {
          set.status = 404;
          return { error: "Message not found" };
        }

        // Ensure user is a member of the room
        const membership = await db.membership.findUnique({
          where: { userId_roomId: { userId, roomId: message.roomId } },
          select: { userId: true },
        });
        if (!membership) {
          set.status = 403;
          return { error: "You are not a member of the room" };
        }

        const attaches = await db.attachment.findMany({
          where: { messageId },
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            url: true,
            type: true,
            name: true,
            size: true,
            userId: true,
            createdAt: true,
          },
        });

        return {
          success: true,
          data: attaches.map((a) => ({
            id: a.id,
            url: a.url,
            type: a.type,
            name: a.name ?? undefined,
            size: a.size ?? undefined,
            userId: a.userId,
            createdAt: a.createdAt.toISOString(),
          })),
        };
      } catch (err: any) {
        console.error("List attachments error:", err);
        set.status = 500;
        return { error: "Failed to list attachments" };
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
              url: t.String(),
              type: t.String(),
              name: t.Optional(t.String()),
              size: t.Optional(t.Number()),
              userId: t.String(),
              createdAt: t.String(),
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

  /* -------------------- List attachments uploaded by current user --------------------
     GET /attachments/me
  */
  .get(
    "/me",
    async ({ userId }) => {
      const attaches = await db.attachment.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          url: true,
          type: true,
          name: true,
          size: true,
          messageId: true,
          createdAt: true,
        },
        take: 100, // limit results for safety; paginate if needed
      });

      return {
        success: true,
        data: attaches.map((a) => ({
          id: a.id,
          url: a.url,
          type: a.type,
          name: a.name ?? undefined,
          size: a.size ?? undefined,
          messageId: a.messageId,
          createdAt: a.createdAt.toISOString(),
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
              url: t.String(),
              type: t.String(),
              name: t.Optional(t.String()),
              size: t.Optional(t.Number()),
              messageId: t.String(),
              createdAt: t.String(),
            })
          ),
        }),
      },
    }
  )

  /* -------------------- Delete attachment --------------------
     DELETE /attachments/:id
     Allowed: uploader, message sender, or room owner
  */
  .delete(
    "/:id",
    async ({ params, userId, set }) => {
      try {
        const att = await db.attachment.findUnique({
          where: { id: params.id },
          select: { id: true, userId: true, messageId: true },
        });

        if (!att) {
          set.status = 404;
          return { error: "Attachment not found" };
        }

        // fetch message (sender and room)
        const message = await db.message.findUnique({
          where: { id: att.messageId },
          select: { id: true, senderId: true, roomId: true },
        });
        if (!message) {
          // orphaned attachment — allow uploader to delete
          if (att.userId !== userId) {
            set.status = 403;
            return { error: "Not authorized to delete attachment" };
          }
          await db.attachment.delete({ where: { id: att.id } });
          return { success: true };
        }

        // allow if uploader
        if (att.userId === userId) {
          await db.attachment.delete({ where: { id: att.id } });
          return { success: true };
        }

        // allow if message sender
        if (message.senderId === userId) {
          await db.attachment.delete({ where: { id: att.id } });
          return { success: true };
        }

        // allow if room owner
        const room = await db.room.findUnique({
          where: { id: message.roomId },
          select: { ownerId: true },
        });
        if (room && room.ownerId === userId) {
          await db.attachment.delete({ where: { id: att.id } });
          return { success: true };
        }

        set.status = 403;
        return { error: "Not authorized to delete attachment" };
      } catch (err: any) {
        console.error("Delete attachment error:", err);
        set.status = 500;
        return { error: "Failed to delete attachment" };
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

export default attachment;
