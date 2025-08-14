import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const RoomPlain = t.Object(
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
);

export const RoomRelations = t.Object(
  {
    owner: __nullable__(
      t.Object(
        {
          id: t.String(),
          email: __nullable__(t.String()),
          phone: __nullable__(t.String()),
          password: t.String(),
          name: t.String(),
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
    members: t.Array(
      t.Object(
        {
          id: t.String(),
          userId: t.String(),
          roomId: t.String(),
          role: t.Union(
            [t.Literal("OWNER"), t.Literal("ADMIN"), t.Literal("MEMBER")],
            { additionalProperties: false },
          ),
          joinedAt: t.Date(),
          mutedUntil: __nullable__(t.Date()),
          lastReadAt: __nullable__(t.Date()),
        },
        { additionalProperties: false },
      ),
      { additionalProperties: false },
    ),
    messages: t.Array(
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
    pinnedMessages: t.Array(
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
  { additionalProperties: false },
);

export const RoomPlainInputCreate = t.Object(
  {
    name: t.Optional(__nullable__(t.String())),
    description: t.Optional(__nullable__(t.String())),
    type: t.Optional(
      t.Union(
        [t.Literal("PRIVATE"), t.Literal("GROUP"), t.Literal("CHANNEL")],
        { additionalProperties: false },
      ),
    ),
    avatar: t.Optional(__nullable__(t.String())),
    messageCount: t.Optional(t.Integer()),
    lastMessageAt: t.Optional(__nullable__(t.Date())),
  },
  { additionalProperties: false },
);

export const RoomPlainInputUpdate = t.Object(
  {
    name: t.Optional(__nullable__(t.String())),
    description: t.Optional(__nullable__(t.String())),
    type: t.Optional(
      t.Union(
        [t.Literal("PRIVATE"), t.Literal("GROUP"), t.Literal("CHANNEL")],
        { additionalProperties: false },
      ),
    ),
    avatar: t.Optional(__nullable__(t.String())),
    messageCount: t.Optional(t.Integer()),
    lastMessageAt: t.Optional(__nullable__(t.Date())),
  },
  { additionalProperties: false },
);

export const RoomRelationsInputCreate = t.Object(
  {
    owner: t.Optional(
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
    members: t.Optional(
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
    messages: t.Optional(
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
    pinnedMessages: t.Optional(
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
  { additionalProperties: false },
);

export const RoomRelationsInputUpdate = t.Partial(
  t.Object(
    {
      owner: t.Partial(
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
      members: t.Partial(
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
      messages: t.Partial(
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
      pinnedMessages: t.Partial(
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
    { additionalProperties: false },
  ),
);

export const RoomWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          name: t.String(),
          description: t.String(),
          type: t.Union(
            [t.Literal("PRIVATE"), t.Literal("GROUP"), t.Literal("CHANNEL")],
            { additionalProperties: false },
          ),
          avatar: t.String(),
          ownerId: t.String(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
          messageCount: t.Integer(),
          lastMessageAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "Room" },
  ),
);

export const RoomWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object({ id: t.String() }, { additionalProperties: false }),
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
              name: t.String(),
              description: t.String(),
              type: t.Union(
                [
                  t.Literal("PRIVATE"),
                  t.Literal("GROUP"),
                  t.Literal("CHANNEL"),
                ],
                { additionalProperties: false },
              ),
              avatar: t.String(),
              ownerId: t.String(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
              messageCount: t.Integer(),
              lastMessageAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Room" },
);

export const RoomSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      name: t.Boolean(),
      description: t.Boolean(),
      type: t.Boolean(),
      avatar: t.Boolean(),
      ownerId: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      messageCount: t.Boolean(),
      lastMessageAt: t.Boolean(),
      owner: t.Boolean(),
      members: t.Boolean(),
      messages: t.Boolean(),
      pinnedMessages: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const RoomInclude = t.Partial(
  t.Object(
    {
      type: t.Boolean(),
      owner: t.Boolean(),
      members: t.Boolean(),
      messages: t.Boolean(),
      pinnedMessages: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const RoomOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      name: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      description: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      avatar: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      ownerId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      updatedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      messageCount: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      lastMessageAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Room = t.Composite([RoomPlain, RoomRelations], {
  additionalProperties: false,
});

export const RoomInputCreate = t.Composite(
  [RoomPlainInputCreate, RoomRelationsInputCreate],
  { additionalProperties: false },
);

export const RoomInputUpdate = t.Composite(
  [RoomPlainInputUpdate, RoomRelationsInputUpdate],
  { additionalProperties: false },
);
