import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const MessageContentPlain = t.Object(
  {
    messageId: t.String(),
    body: __nullable__(t.String()),
    edited: t.Boolean(),
    editedAt: __nullable__(t.Date()),
  },
  {
    additionalProperties: false,
    description: `*
* MessageContent: large text fields separated for performance
* - messageId uses the Message.id as the primary key (one-to-one)
* - use @db.Text for PostgreSQL text type`,
  },
);

export const MessageContentRelations = t.Object(
  {
    message: t.Object(
      {
        id: t.String(),
        roomId: t.String(),
        senderId: t.String(),
        receiverId: __nullable__(t.String()),
        replyToId: __nullable__(t.String()),
        createdAt: t.Date(),
        updatedAt: t.Date(),
        deleted: t.Boolean(),
        deletedAt: __nullable__(t.Date()),
        status: t.Union(
          [
            t.Literal("SENT"),
            t.Literal("DELIVERED"),
            t.Literal("READ"),
            t.Literal("FAILED"),
          ],
          { additionalProperties: false },
        ),
        reactionsCount: t.Integer(),
      },
      {
        additionalProperties: false,
        description: `*
* Message & MessageContent separation:
* - Message: hot metadata (fast queries for lists)
* - MessageContent: large text stored in separate table (read on-demand)`,
      },
    ),
  },
  {
    additionalProperties: false,
    description: `*
* MessageContent: large text fields separated for performance
* - messageId uses the Message.id as the primary key (one-to-one)
* - use @db.Text for PostgreSQL text type`,
  },
);

export const MessageContentPlainInputCreate = t.Object(
  {
    body: t.Optional(__nullable__(t.String())),
    edited: t.Optional(t.Boolean()),
    editedAt: t.Optional(__nullable__(t.Date())),
  },
  {
    additionalProperties: false,
    description: `*
* MessageContent: large text fields separated for performance
* - messageId uses the Message.id as the primary key (one-to-one)
* - use @db.Text for PostgreSQL text type`,
  },
);

export const MessageContentPlainInputUpdate = t.Object(
  {
    body: t.Optional(__nullable__(t.String())),
    edited: t.Optional(t.Boolean()),
    editedAt: t.Optional(__nullable__(t.Date())),
  },
  {
    additionalProperties: false,
    description: `*
* MessageContent: large text fields separated for performance
* - messageId uses the Message.id as the primary key (one-to-one)
* - use @db.Text for PostgreSQL text type`,
  },
);

export const MessageContentRelationsInputCreate = t.Object(
  {
    message: t.Object(
      {
        connect: t.Object(
          {
            id: t.String({ additionalProperties: false }),
          },
          { additionalProperties: false },
        ),
      },
      { additionalProperties: false },
    ),
  },
  {
    additionalProperties: false,
    description: `*
* MessageContent: large text fields separated for performance
* - messageId uses the Message.id as the primary key (one-to-one)
* - use @db.Text for PostgreSQL text type`,
  },
);

export const MessageContentRelationsInputUpdate = t.Partial(
  t.Object(
    {
      message: t.Object(
        {
          connect: t.Object(
            {
              id: t.String({ additionalProperties: false }),
            },
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
    },
    {
      additionalProperties: false,
      description: `*
* MessageContent: large text fields separated for performance
* - messageId uses the Message.id as the primary key (one-to-one)
* - use @db.Text for PostgreSQL text type`,
    },
  ),
);

export const MessageContentWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          messageId: t.String(),
          body: t.String(),
          edited: t.Boolean(),
          editedAt: t.Date(),
        },
        {
          additionalProperties: false,
          description: `*
* MessageContent: large text fields separated for performance
* - messageId uses the Message.id as the primary key (one-to-one)
* - use @db.Text for PostgreSQL text type`,
        },
      ),
    { $id: "MessageContent" },
  ),
);

export const MessageContentWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { messageId: t.String() },
            {
              additionalProperties: false,
              description: `*
* MessageContent: large text fields separated for performance
* - messageId uses the Message.id as the primary key (one-to-one)
* - use @db.Text for PostgreSQL text type`,
            },
          ),
          { additionalProperties: false },
        ),
        t.Union([t.Object({ messageId: t.String() })], {
          additionalProperties: false,
        }),
        t.Partial(
          t.Object({
            AND: t.Union([
              Self,
              t.Array(Self, { additionalProperties: false }),
            ]),
            NOT: t.Union([
              Self,
              t.Array(Self, { additionalProperties: false }),
            ]),
            OR: t.Array(Self, { additionalProperties: false }),
          }),
          { additionalProperties: false },
        ),
        t.Partial(
          t.Object(
            {
              messageId: t.String(),
              body: t.String(),
              edited: t.Boolean(),
              editedAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "MessageContent" },
);

export const MessageContentSelect = t.Partial(
  t.Object(
    {
      messageId: t.Boolean(),
      body: t.Boolean(),
      edited: t.Boolean(),
      editedAt: t.Boolean(),
      message: t.Boolean(),
      _count: t.Boolean(),
    },
    {
      additionalProperties: false,
      description: `*
* MessageContent: large text fields separated for performance
* - messageId uses the Message.id as the primary key (one-to-one)
* - use @db.Text for PostgreSQL text type`,
    },
  ),
);

export const MessageContentInclude = t.Partial(
  t.Object(
    { message: t.Boolean(), _count: t.Boolean() },
    {
      additionalProperties: false,
      description: `*
* MessageContent: large text fields separated for performance
* - messageId uses the Message.id as the primary key (one-to-one)
* - use @db.Text for PostgreSQL text type`,
    },
  ),
);

export const MessageContentOrderBy = t.Partial(
  t.Object(
    {
      messageId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      body: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      edited: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      editedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    {
      additionalProperties: false,
      description: `*
* MessageContent: large text fields separated for performance
* - messageId uses the Message.id as the primary key (one-to-one)
* - use @db.Text for PostgreSQL text type`,
    },
  ),
);

export const MessageContent = t.Composite(
  [MessageContentPlain, MessageContentRelations],
  { additionalProperties: false },
);

export const MessageContentInputCreate = t.Composite(
  [MessageContentPlainInputCreate, MessageContentRelationsInputCreate],
  { additionalProperties: false },
);

export const MessageContentInputUpdate = t.Composite(
  [MessageContentPlainInputUpdate, MessageContentRelationsInputUpdate],
  { additionalProperties: false },
);
