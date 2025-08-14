import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const MessagePlain = t.Object(
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
);

export const MessageRelations = t.Object(
  {
    room: t.Object(
      {
        id: t.String(),
        name: __nullable__(t.String()),
        description: __nullable__(t.String()),
        type: t.Union(
          [t.Literal("PRIVATE"), t.Literal("GROUP"), t.Literal("CHANNEL")],
          { additionalProperties: false },
        ),
        avatar: __nullable__(t.String()),
        ownerId: __nullable__(t.String()),
        createdAt: t.Date(),
        updatedAt: t.Date(),
        messageCount: t.Integer(),
        lastMessageAt: __nullable__(t.Date()),
      },
      { additionalProperties: false },
    ),
    sender: t.Object(
      {
        id: t.String(),
        email: __nullable__(t.String()),
        phone: __nullable__(t.String()),
        password: t.String(),
        username: t.String(),
        avatar: __nullable__(t.String()),
        status: __nullable__(t.String()),
        lastSeen: __nullable__(t.Date()),
        bio: __nullable__(t.String()),
        verified: t.Boolean(),
        verificationCode: __nullable__(t.String()),
        verificationCodeExpires: __nullable__(t.Date()),
        createdAt: t.Date(),
        updatedAt: t.Date(),
      },
      { additionalProperties: false },
    ),
    receiver: __nullable__(
      t.Object(
        {
          id: t.String(),
          email: __nullable__(t.String()),
          phone: __nullable__(t.String()),
          password: t.String(),
          username: t.String(),
          avatar: __nullable__(t.String()),
          status: __nullable__(t.String()),
          lastSeen: __nullable__(t.Date()),
          bio: __nullable__(t.String()),
          verified: t.Boolean(),
          verificationCode: __nullable__(t.String()),
          verificationCodeExpires: __nullable__(t.Date()),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    ),
    replyTo: __nullable__(
      t.Object(
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
    ),
    replies: t.Array(
      t.Object(
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
      { additionalProperties: false },
    ),
    reactions: t.Array(
      t.Object(
        {
          id: t.String(),
          emoji: t.String(),
          messageId: t.String(),
          userId: t.String(),
          createdAt: t.Date(),
        },
        { additionalProperties: false },
      ),
      { additionalProperties: false },
    ),
    attachments: t.Array(
      t.Object(
        {
          id: t.String(),
          url: t.String(),
          type: t.Union(
            [
              t.Literal("IMAGE"),
              t.Literal("VIDEO"),
              t.Literal("AUDIO"),
              t.Literal("DOCUMENT"),
              t.Literal("OTHER"),
            ],
            { additionalProperties: false },
          ),
          name: __nullable__(t.String()),
          size: __nullable__(t.Integer()),
          messageId: t.String(),
          userId: t.String(),
          createdAt: t.Date(),
        },
        { additionalProperties: false },
      ),
      { additionalProperties: false },
    ),
    readReceipts: t.Array(
      t.Object(
        {
          id: t.String(),
          messageId: t.String(),
          userId: t.String(),
          readAt: t.Date(),
        },
        { additionalProperties: false },
      ),
      { additionalProperties: false },
    ),
    content: __nullable__(
      t.Object(
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
      ),
    ),
    pinnedIn: t.Array(
      t.Object(
        {
          id: t.String(),
          messageId: t.String(),
          roomId: t.String(),
          pinnedById: t.String(),
          pinnedAt: t.Date(),
          note: __nullable__(t.String()),
        },
        { additionalProperties: false },
      ),
      { additionalProperties: false },
    ),
  },
  {
    additionalProperties: false,
    description: `*
* Message & MessageContent separation:
* - Message: hot metadata (fast queries for lists)
* - MessageContent: large text stored in separate table (read on-demand)`,
  },
);

export const MessagePlainInputCreate = t.Object(
  {
    deleted: t.Optional(t.Boolean()),
    deletedAt: t.Optional(__nullable__(t.Date())),
    status: t.Optional(
      t.Union(
        [
          t.Literal("SENT"),
          t.Literal("DELIVERED"),
          t.Literal("READ"),
          t.Literal("FAILED"),
        ],
        { additionalProperties: false },
      ),
    ),
    reactionsCount: t.Optional(t.Integer()),
  },
  {
    additionalProperties: false,
    description: `*
* Message & MessageContent separation:
* - Message: hot metadata (fast queries for lists)
* - MessageContent: large text stored in separate table (read on-demand)`,
  },
);

export const MessagePlainInputUpdate = t.Object(
  {
    deleted: t.Optional(t.Boolean()),
    deletedAt: t.Optional(__nullable__(t.Date())),
    status: t.Optional(
      t.Union(
        [
          t.Literal("SENT"),
          t.Literal("DELIVERED"),
          t.Literal("READ"),
          t.Literal("FAILED"),
        ],
        { additionalProperties: false },
      ),
    ),
    reactionsCount: t.Optional(t.Integer()),
  },
  {
    additionalProperties: false,
    description: `*
* Message & MessageContent separation:
* - Message: hot metadata (fast queries for lists)
* - MessageContent: large text stored in separate table (read on-demand)`,
  },
);

export const MessageRelationsInputCreate = t.Object(
  {
    room: t.Object(
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
    sender: t.Object(
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
    receiver: t.Optional(
      t.Object(
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
    ),
    replyTo: t.Optional(
      t.Object(
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
    ),
    replies: t.Optional(
      t.Object(
        {
          connect: t.Array(
            t.Object(
              {
                id: t.String({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
    ),
    reactions: t.Optional(
      t.Object(
        {
          connect: t.Array(
            t.Object(
              {
                id: t.String({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
    ),
    attachments: t.Optional(
      t.Object(
        {
          connect: t.Array(
            t.Object(
              {
                id: t.String({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
    ),
    readReceipts: t.Optional(
      t.Object(
        {
          connect: t.Array(
            t.Object(
              {
                id: t.String({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
    ),
    content: t.Optional(
      t.Object(
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
    ),
    pinnedIn: t.Optional(
      t.Object(
        {
          connect: t.Array(
            t.Object(
              {
                id: t.String({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
    ),
  },
  {
    additionalProperties: false,
    description: `*
* Message & MessageContent separation:
* - Message: hot metadata (fast queries for lists)
* - MessageContent: large text stored in separate table (read on-demand)`,
  },
);

export const MessageRelationsInputUpdate = t.Partial(
  t.Object(
    {
      room: t.Object(
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
      sender: t.Object(
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
      receiver: t.Partial(
        t.Object(
          {
            connect: t.Object(
              {
                id: t.String({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            disconnect: t.Boolean(),
          },
          { additionalProperties: false },
        ),
      ),
      replyTo: t.Partial(
        t.Object(
          {
            connect: t.Object(
              {
                id: t.String({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            disconnect: t.Boolean(),
          },
          { additionalProperties: false },
        ),
      ),
      replies: t.Partial(
        t.Object(
          {
            connect: t.Array(
              t.Object(
                {
                  id: t.String({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
            disconnect: t.Array(
              t.Object(
                {
                  id: t.String({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
          },
          { additionalProperties: false },
        ),
      ),
      reactions: t.Partial(
        t.Object(
          {
            connect: t.Array(
              t.Object(
                {
                  id: t.String({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
            disconnect: t.Array(
              t.Object(
                {
                  id: t.String({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
          },
          { additionalProperties: false },
        ),
      ),
      attachments: t.Partial(
        t.Object(
          {
            connect: t.Array(
              t.Object(
                {
                  id: t.String({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
            disconnect: t.Array(
              t.Object(
                {
                  id: t.String({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
          },
          { additionalProperties: false },
        ),
      ),
      readReceipts: t.Partial(
        t.Object(
          {
            connect: t.Array(
              t.Object(
                {
                  id: t.String({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
            disconnect: t.Array(
              t.Object(
                {
                  id: t.String({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
          },
          { additionalProperties: false },
        ),
      ),
      content: t.Partial(
        t.Object(
          {
            connect: t.Object(
              {
                id: t.String({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            disconnect: t.Boolean(),
          },
          { additionalProperties: false },
        ),
      ),
      pinnedIn: t.Partial(
        t.Object(
          {
            connect: t.Array(
              t.Object(
                {
                  id: t.String({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
            disconnect: t.Array(
              t.Object(
                {
                  id: t.String({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
          },
          { additionalProperties: false },
        ),
      ),
    },
    {
      additionalProperties: false,
      description: `*
* Message & MessageContent separation:
* - Message: hot metadata (fast queries for lists)
* - MessageContent: large text stored in separate table (read on-demand)`,
    },
  ),
);

export const MessageWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          roomId: t.String(),
          senderId: t.String(),
          receiverId: t.String(),
          replyToId: t.String(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
          deleted: t.Boolean(),
          deletedAt: t.Date(),
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
    { $id: "Message" },
  ),
);

export const MessageWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { id: t.String() },
            {
              additionalProperties: false,
              description: `*
* Message & MessageContent separation:
* - Message: hot metadata (fast queries for lists)
* - MessageContent: large text stored in separate table (read on-demand)`,
            },
          ),
          { additionalProperties: false },
        ),
        t.Union([t.Object({ id: t.String() })], {
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
              id: t.String(),
              roomId: t.String(),
              senderId: t.String(),
              receiverId: t.String(),
              replyToId: t.String(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
              deleted: t.Boolean(),
              deletedAt: t.Date(),
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
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Message" },
);

export const MessageSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      roomId: t.Boolean(),
      senderId: t.Boolean(),
      receiverId: t.Boolean(),
      replyToId: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      deleted: t.Boolean(),
      deletedAt: t.Boolean(),
      status: t.Boolean(),
      reactionsCount: t.Boolean(),
      room: t.Boolean(),
      sender: t.Boolean(),
      receiver: t.Boolean(),
      replyTo: t.Boolean(),
      replies: t.Boolean(),
      reactions: t.Boolean(),
      attachments: t.Boolean(),
      readReceipts: t.Boolean(),
      content: t.Boolean(),
      pinnedIn: t.Boolean(),
      _count: t.Boolean(),
    },
    {
      additionalProperties: false,
      description: `*
* Message & MessageContent separation:
* - Message: hot metadata (fast queries for lists)
* - MessageContent: large text stored in separate table (read on-demand)`,
    },
  ),
);

export const MessageInclude = t.Partial(
  t.Object(
    {
      status: t.Boolean(),
      room: t.Boolean(),
      sender: t.Boolean(),
      receiver: t.Boolean(),
      replyTo: t.Boolean(),
      replies: t.Boolean(),
      reactions: t.Boolean(),
      attachments: t.Boolean(),
      readReceipts: t.Boolean(),
      content: t.Boolean(),
      pinnedIn: t.Boolean(),
      _count: t.Boolean(),
    },
    {
      additionalProperties: false,
      description: `*
* Message & MessageContent separation:
* - Message: hot metadata (fast queries for lists)
* - MessageContent: large text stored in separate table (read on-demand)`,
    },
  ),
);

export const MessageOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      roomId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      senderId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      receiverId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      replyToId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      updatedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      deleted: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      deletedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      reactionsCount: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    {
      additionalProperties: false,
      description: `*
* Message & MessageContent separation:
* - Message: hot metadata (fast queries for lists)
* - MessageContent: large text stored in separate table (read on-demand)`,
    },
  ),
);

export const Message = t.Composite([MessagePlain, MessageRelations], {
  additionalProperties: false,
});

export const MessageInputCreate = t.Composite(
  [MessagePlainInputCreate, MessageRelationsInputCreate],
  { additionalProperties: false },
);

export const MessageInputUpdate = t.Composite(
  [MessagePlainInputUpdate, MessageRelationsInputUpdate],
  { additionalProperties: false },
);
