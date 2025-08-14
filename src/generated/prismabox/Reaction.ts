import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const ReactionPlain = t.Object(
  {
    id: t.String(),
    emoji: t.String(),
    messageId: t.String(),
    userId: t.String(),
    createdAt: t.Date(),
  },
  { additionalProperties: false },
);

export const ReactionRelations = t.Object(
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
    user: t.Object(
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

export const ReactionPlainInputCreate = t.Object(
  { emoji: t.String() },
  { additionalProperties: false },
);

export const ReactionPlainInputUpdate = t.Object(
  { emoji: t.Optional(t.String()) },
  { additionalProperties: false },
);

export const ReactionRelationsInputCreate = t.Object(
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
    user: t.Object(
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

export const ReactionRelationsInputUpdate = t.Partial(
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
      user: t.Object(
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

export const ReactionWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          emoji: t.String(),
          messageId: t.String(),
          userId: t.String(),
          createdAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "Reaction" },
  ),
);

export const ReactionWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            {
              id: t.String(),
              messageId_userId_emoji: t.Object(
                {
                  messageId: t.String(),
                  userId: t.String(),
                  emoji: t.String(),
                },
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
              messageId_userId_emoji: t.Object(
                {
                  messageId: t.String(),
                  userId: t.String(),
                  emoji: t.String(),
                },
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
              emoji: t.String(),
              messageId: t.String(),
              userId: t.String(),
              createdAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Reaction" },
);

export const ReactionSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      emoji: t.Boolean(),
      messageId: t.Boolean(),
      userId: t.Boolean(),
      createdAt: t.Boolean(),
      message: t.Boolean(),
      user: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const ReactionInclude = t.Partial(
  t.Object(
    { message: t.Boolean(), user: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const ReactionOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      emoji: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      messageId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      userId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Reaction = t.Composite([ReactionPlain, ReactionRelations], {
  additionalProperties: false,
});

export const ReactionInputCreate = t.Composite(
  [ReactionPlainInputCreate, ReactionRelationsInputCreate],
  { additionalProperties: false },
);

export const ReactionInputUpdate = t.Composite(
  [ReactionPlainInputUpdate, ReactionRelationsInputUpdate],
  { additionalProperties: false },
);
