import bearer from "@elysiajs/bearer";
import jwt from "@elysiajs/jwt";
import { Elysia, t } from "elysia";
import db from "../db/init";
import { NotificationType } from "../../generated/prisma";

interface JWTPayload {
  id: string;
  username?: string;
}
const SECRET = Bun.env.AUTH_SECRET_KEY ?? "dev-secret";

/**
 * Notification plugin
 * - GET /notifications
 * - POST /notifications  (create for a user; optional type, defaults to SYSTEM)
 * - PATCH /notifications/:id/read
 * - POST  /notifications/mark-all-read
 * - DELETE /notifications/:id
 */
export const notification = new Elysia({ prefix: "/notifications" })
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

  /* List current user's notifications (paginated) */
  .get(
    "/",
    async ({ userId, query, set }) => {
      try {
        const limitRaw = Number(query.limit ?? 50);
        const limit = Math.min(
          Math.max(1, isNaN(limitRaw) ? 50 : limitRaw),
          100
        );
        const before = query.before ?? null;

        const where: any = { userId };
        if (before) {
          const beforeDate = new Date(before);
          if (isNaN(beforeDate.getTime())) {
            set.status = 400;
            return { error: "Invalid 'before' cursor" };
          }
          where.createdAt = { lt: beforeDate };
        }

        const items = await db.notification.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: limit,
          select: {
            id: true,
            type: true,
            title: true,
            body: true,
            data: true,
            read: true,
            createdAt: true,
          },
        });

        return {
          success: true,
          data: items.map((n) => ({
            id: n.id,
            type: n.type,
            title: n.title,
            body: n.body,
            data: n.data ?? undefined,
            read: n.read,
            createdAt: n.createdAt.toISOString(),
          })),
        };
      } catch (err: any) {
        console.error("List notifications error:", err);
        set.status = 500;
        return { error: "Failed to list notifications" };
      }
    },
    {
      response: {
        200: t.Object({
          success: t.Boolean(),
          data: t.Array(
            t.Object({
              id: t.String(),
              type: t.String(),
              title: t.String(),
              body: t.String(),
              data: t.Optional(t.Any()),
              read: t.Boolean(),
              createdAt: t.String(),
            })
          ),
        }),
        400: t.Object({ error: t.String() }),
        401: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
      },
    }
  )

  /* Create notification for a user (system/admin use)
     body: { toUserId, title, body, data?, type? }
     type defaults to NotificationType.SYSTEM if not provided
  */
  .post(
    "/",
    async ({ body, userId, set }) => {
      try {
        const {
          toUserId,
          title,
          body: content,
          data,
          type,
        } = body as {
          toUserId: string;
          title: string;
          body: string;
          data?: any;
          type?: keyof typeof NotificationType | NotificationType;
        };

        // Basic validation
        if (!toUserId || !title || !content) {
          set.status = 400;
          return { error: "toUserId, title and body are required" };
        }

        // Ensure recipient exists
        const userExists = await db.user.findUnique({
          where: { id: toUserId },
          select: { id: true },
        });
        if (!userExists) {
          set.status = 404;
          return { error: "Recipient not found" };
        }

        // Determine notification type (default to SYSTEM)
        let notifType: NotificationType;
        if (!type) {
          notifType = NotificationType.SYSTEM;
        } else {
          // Accept either enum value or string key
          const tStr = String(type);
          if ((Object.values(NotificationType) as string[]).includes(tStr)) {
            notifType = tStr as NotificationType;
          } else {
            set.status = 400;
            return { error: "Invalid notification type" };
          }
        }

        const created = await db.notification.create({
          data: {
            userId: toUserId,
            type: notifType,
            title,
            body: content,
            data: data ?? null,
            read: false,
          },
          select: {
            id: true,
            type: true,
            title: true,
            body: true,
            data: true,
            read: true,
            createdAt: true,
          },
        });

        return {
          success: true,
          data: {
            id: created.id,
            type: created.type,
            title: created.title,
            body: created.body,
            data: created.data ?? undefined,
            read: created.read,
            createdAt: created.createdAt.toISOString(),
          },
        };
      } catch (err: any) {
        console.error("Create notification error:", err);
        set.status = 500;
        return { error: "Failed to create notification" };
      }
    },
    {
      body: t.Object({
        toUserId: t.String(),
        title: t.String(),
        body: t.String(),
        data: t.Optional(t.Any()),
        type: t.Optional(
          t.Enum({
            MESSAGE: "MESSAGE",
            MENTION: "MENTION",
            INVITATION: "INVITATION",
            SYSTEM: "SYSTEM",
          })
        ),
      }),
      response: {
        200: t.Object({
          success: t.Boolean(),
          data: t.Object({
            id: t.String(),
            type: t.String(),
            title: t.String(),
            body: t.String(),
            data: t.Optional(t.Any()),
            read: t.Boolean(),
            createdAt: t.String(),
          }),
        }),
        400: t.Object({ error: t.String() }),
        401: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
      },
    }
  )

  /* Mark a notification as read/unread */
  .patch(
    "/:id/read",
    async ({ params, body, userId, set }) => {
      try {
        const { id } = params;
        const { read } = body as { read: boolean };

        const notif = await db.notification.findUnique({
          where: { id },
          select: { id: true, userId: true },
        });
        if (!notif) {
          set.status = 404;
          return { error: "Notification not found" };
        }
        if (notif.userId !== userId) {
          set.status = 403;
          return { error: "Not authorized" };
        }

        const updated = await db.notification.update({
          where: { id },
          data: { read },
          select: { id: true, read: true, createdAt: true },
        });

        return {
          success: true,
          data: {
            id: updated.id,
            read: updated.read,
            createdAt: updated.createdAt.toISOString(),
          },
        };
      } catch (err: any) {
        console.error("Mark notification read error:", err);
        set.status = 500;
        return { error: "Failed to update notification" };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({ read: t.Boolean() }),
      response: {
        200: t.Object({
          success: t.Boolean(),
          data: t.Object({
            id: t.String(),
            read: t.Boolean(),
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

  /* Mark all notifications as read for current user */
  .post(
    "/mark-all-read",
    async ({ userId, set }) => {
      try {
        await db.notification.updateMany({
          where: { userId, read: false },
          data: { read: true },
        });
        return { success: true };
      } catch (err: any) {
        console.error("Mark all read error:", err);
        set.status = 500;
        return { error: "Failed to mark notifications" };
      }
    },
    {
      response: {
        200: t.Object({ success: t.Boolean() }),
        401: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
      },
    }
  )

  /* Delete notification (user only) */
  .delete(
    "/:id",
    async ({ params, userId, set }) => {
      try {
        const n = await db.notification.findUnique({
          where: { id: params.id },
          select: { id: true, userId: true },
        });
        if (!n) {
          set.status = 404;
          return { error: "Notification not found" };
        }
        if (n.userId !== userId) {
          set.status = 403;
          return { error: "Not authorized" };
        }
        await db.notification.delete({ where: { id: params.id } });
        return { success: true };
      } catch (err: any) {
        console.error("Delete notification error:", err);
        set.status = 500;
        return { error: "Failed to delete notification" };
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

export default notification;
