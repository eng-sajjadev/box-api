import Elysia, { t } from "elysia";
import jwt from "@elysiajs/jwt";
import bearer from "@elysiajs/bearer";
import db from "../db/init"; // adjust path to your prisma client

interface JWTPayload {
  id: string;
  username?: string;
}

const contact = new Elysia({ prefix: "/contact" })
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.AUTH_SECRET_KEY ?? "dev-secret",
    })
  )
  .use(bearer())
  // Derive userId into the request context (typed)
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

  /* -------------------- Create contact -------------------- */
  .post(
    "/",
    async ({ body, userId, set }) => {
      try {
        // Prevent adding self
        if (userId === body.contactId) {
          set.status = 400;
          return { error: "Cannot add yourself as a contact" };
        }

        // Ensure contact user exists
        const contactExists = await db.user.findUnique({
          where: { id: body.contactId },
          select: { id: true },
        });

        if (!contactExists) {
          set.status = 404;
          return { error: "User not found" };
        }

        // Prevent duplicate contact entry (same user/contact pair)
        const existingContact = await db.contact.findUnique({
          where: {
            userId_contactId: {
              userId,
              contactId: body.contactId,
            },
          },
        });

        if (existingContact) {
          set.status = 409;
          return { error: "Contact already exists" };
        }

        // APP-LEVEL: If name provided, ensure the same user doesn't already have that name
        if (body.name) {
          const duplicateName = await db.contact.findFirst({
            where: { userId, name: body.name },
            select: { id: true },
          });

          if (duplicateName) {
            set.status = 409;
            return { error: "You already have a contact with that name" };
          }
        }

        // Create contact
        const newContact = await db.contact.create({
          data: {
            userId,
            contactId: body.contactId,
            name: body.name,
          },
          select: {
            id: true,
            name: true,
            createdAt: true,
            contactUser: {
              select: {
                id: true,
                username: true,
                avatar: true,
                status: true,
                lastSeen: true,
              },
            },
          },
        });

        return {
          success: true,
          data: {
            id: newContact.id,
            name: newContact.name ?? undefined,
            createdAt: newContact.createdAt.toISOString(),
            contactUser: {
              id: newContact.contactUser.id,
              username: newContact.contactUser.username,
              avatar: newContact.contactUser.avatar ?? undefined,
              status: newContact.contactUser.status ?? undefined,
              lastSeen:
                newContact.contactUser.lastSeen?.toISOString() ?? undefined,
            },
          },
        };
      } catch (err: any) {
        // Prisma unique constraint error (if you add DB-level unique constraint)
        if (err?.code === "P2002") {
          set.status = 409;
          return { error: "You already have a contact with that name" };
        }

        console.error("Add contact error:", err);
        set.status = 500;
        return { error: "Failed to add contact" };
      }
    },
    {
      body: t.Object({
        contactId: t.String(),
        name: t.Optional(t.String({ maxLength: 50 })),
      }),
      response: {
        200: t.Object({
          success: t.Boolean(),
          data: t.Object({
            id: t.String(),
            name: t.Optional(t.String()),
            createdAt: t.String(),
            contactUser: t.Object({
              id: t.String(),
              username: t.String(),
              avatar: t.Optional(t.String()),
              status: t.Optional(t.String()),
              lastSeen: t.Optional(t.String()),
            }),
          }),
        }),
        400: t.Object({ error: t.String() }),
        401: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
        409: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
      },
    }
  )

  /* -------------------- List contacts -------------------- */
  .get(
    "/",
    async ({ userId }) => {
      const contacts = await db.contact.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          createdAt: true,
          contactUser: {
            select: {
              id: true,
              username: true,
              avatar: true,
              status: true,
              lastSeen: true,
              bio: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        success: true,
        data: contacts.map((c) => ({
          id: c.id,
          name: c.name ?? undefined,
          createdAt: c.createdAt.toISOString(),
          contactUser: {
            id: c.contactUser.id,
            username: c.contactUser.username,
            avatar: c.contactUser.avatar ?? undefined,
            status: c.contactUser.status ?? undefined,
            bio: c.contactUser.bio ?? undefined,
            lastSeen: c.contactUser.lastSeen?.toISOString() ?? undefined,
          },
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
              createdAt: t.String(),
              contactUser: t.Object({
                id: t.String(),
                username: t.String(),
                avatar: t.Optional(t.String()),
                status: t.Optional(t.String()),
                lastSeen: t.Optional(t.String()),
                bio: t.Optional(t.String()),
              }),
            })
          ),
        }),
      },
    }
  )

  /* -------------------- Update contact name -------------------- */
  .patch(
    "/:id",
    async ({ params, body, userId, set }) => {
      try {
        // APP-LEVEL: If renaming, ensure the new name isn't already used by another contact of the user
        if (body.name) {
          const duplicateName = await db.contact.findFirst({
            where: {
              userId,
              name: body.name,
              NOT: { id: params.id },
            },
            select: { id: true },
          });

          if (duplicateName) {
            set.status = 409;
            return { error: "You already have a contact with that name" };
          }
        }

        // Enforce ownership and perform update
        const res = await db.contact.updateMany({
          where: { id: params.id, userId },
          data: { name: body.name },
        });

        if (res.count === 0) {
          set.status = 404;
          return { error: "Contact not found" };
        }

        // Fetch updated record for response
        const updated = await db.contact.findUnique({
          where: { id: params.id },
          select: {
            id: true,
            name: true,
            contactUser: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        });

        return {
          success: true,
          data: {
            id: updated!.id,
            // guarantee string type for response schema
            name: updated!.name ?? "",
            contactUser: {
              id: updated!.contactUser.id,
              username: updated!.contactUser.username,
            },
          },
        };
      } catch (err: any) {
        if (err?.code === "P2002") {
          set.status = 409;
          return { error: "You already have a contact with that name" };
        }
        console.error("Update contact error:", err);
        set.status = 500;
        return { error: "Failed to update contact" };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 50 }),
      }),
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: t.Object({
          success: t.Boolean(),
          data: t.Object({
            id: t.String(),
            name: t.String(),
            contactUser: t.Object({
              id: t.String(),
              username: t.String(),
            }),
          }),
        }),
        400: t.Object({ error: t.String() }),
        401: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
        409: t.Object({ error: t.String() }),
      },
    }
  )

  /* -------------------- Delete contact -------------------- */
  .delete(
    "/:id",
    async ({ params, userId, set }) => {
      try {
        // enforce ownership
        const res = await db.contact.deleteMany({
          where: { id: params.id, userId },
        });

        if (res.count === 0) {
          set.status = 404;
          return { error: "Contact not found" };
        }

        return { success: true };
      } catch (err) {
        console.error("Delete contact error:", err);
        set.status = 500;
        return { error: "Failed to delete contact" };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: t.Object({
          success: t.Boolean(),
        }),
        401: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
      },
    }
  );

export default contact;
