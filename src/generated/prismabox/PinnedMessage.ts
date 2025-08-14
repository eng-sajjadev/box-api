import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const PinnedMessagePlain = t.Object(
  {
    id: t.String(),
    messageId: t.String(),
    roomId: t.String(),
    pinnedById: t.String(),
    pinnedAt: t.Date(),
    note: __nullable__(t.String()),
  },
  { additionalProperties: false },
);

export const PinnedMessageRelations = t.Object(
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
    pinnedBy: t.Object(
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
  },
  { additionalProperties: false },
);

export const PinnedMessagePlainInputCreate = t.Object(
  {
    pinnedAt: t.Optional(t.Date()),
    note: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const PinnedMessagePlainInputUpdate = t.Object(
  {
    pinnedAt: t.Optional(t.Date()),
    note: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const PinnedMessageRelationsInputCreate = t.Object(
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
    pinnedBy: t.Object(
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
  { additionalProperties: false },
);

export const PinnedMessageRelationsInputUpdate = t.Partial(
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
      pinnedBy: t.Object(
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
    { additionalProperties: false },
  ),
);

export const PinnedMessageWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          messageId: t.String(),
          roomId: t.String(),
          pinnedById: t.String(),
          pinnedAt: t.Date(),
          note: t.String(),
        },
        { additionalProperties: false },
      ),
    { $id: "PinnedMessage" },
  ),
);

export const PinnedMessageWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            {
              id: t.String(),
              messageId_roomId: t.Object(
                { messageId: t.String(), roomId: t.String() },
                { additionalProperties: false },
              ),
            },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [
            t.Object({ id: t.String() }),
            t.Object({
              messageId_roomId: t.Object(
                { messageId: t.String(), roomId: t.String() },
                { additionalProperties: false },
              ),
            }),
          ],
          { additionalProperties: false },
        ),
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
              messageId: t.String(),
              roomId: t.String(),
              pinnedById: t.String(),
              pinnedAt: t.Date(),
              note: t.String(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "PinnedMessage" },
);

export const PinnedMessageSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      messageId: t.Boolean(),
      roomId: t.Boolean(),
      pinnedById: t.Boolean(),
      pinnedAt: t.Boolean(),
      note: t.Boolean(),
      message: t.Boolean(),
      room: t.Boolean(),
      pinnedBy: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const PinnedMessageInclude = t.Partial(
  t.Object(
    {
      message: t.Boolean(),
      room: t.Boolean(),
      pinnedBy: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const PinnedMessageOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      messageId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      roomId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      pinnedById: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      pinnedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      note: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const PinnedMessage = t.Composite(
  [PinnedMessagePlain, PinnedMessageRelations],
  { additionalProperties: false },
);

export const PinnedMessageInputCreate = t.Composite(
  [PinnedMessagePlainInputCreate, PinnedMessageRelationsInputCreate],
  { additionalProperties: false },
);

export const PinnedMessageInputUpdate = t.Composite(
  [PinnedMessagePlainInputUpdate, PinnedMessageRelationsInputUpdate],
  { additionalProperties: false },
);
