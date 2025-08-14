import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const ReadReceiptPlain = t.Object(
  {
    id: t.String(),
    messageId: t.String(),
    userId: t.String(),
    readAt: t.Date(),
  },
  { additionalProperties: false },
);

export const ReadReceiptRelations = t.Object(
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
  },
  { additionalProperties: false },
);

export const ReadReceiptPlainInputCreate = t.Object(
  { readAt: t.Optional(t.Date()) },
  { additionalProperties: false },
);

export const ReadReceiptPlainInputUpdate = t.Object(
  { readAt: t.Optional(t.Date()) },
  { additionalProperties: false },
);

export const ReadReceiptRelationsInputCreate = t.Object(
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

export const ReadReceiptRelationsInputUpdate = t.Partial(
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

export const ReadReceiptWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          messageId: t.String(),
          userId: t.String(),
          readAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "ReadReceipt" },
  ),
);

export const ReadReceiptWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            {
              id: t.String(),
              messageId_userId: t.Object(
                { messageId: t.String(), userId: t.String() },
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
              messageId_userId: t.Object(
                { messageId: t.String(), userId: t.String() },
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
              userId: t.String(),
              readAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "ReadReceipt" },
);

export const ReadReceiptSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      messageId: t.Boolean(),
      userId: t.Boolean(),
      readAt: t.Boolean(),
      message: t.Boolean(),
      user: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const ReadReceiptInclude = t.Partial(
  t.Object(
    { message: t.Boolean(), user: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const ReadReceiptOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      messageId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      userId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      readAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const ReadReceipt = t.Composite(
  [ReadReceiptPlain, ReadReceiptRelations],
  { additionalProperties: false },
);

export const ReadReceiptInputCreate = t.Composite(
  [ReadReceiptPlainInputCreate, ReadReceiptRelationsInputCreate],
  { additionalProperties: false },
);

export const ReadReceiptInputUpdate = t.Composite(
  [ReadReceiptPlainInputUpdate, ReadReceiptRelationsInputUpdate],
  { additionalProperties: false },
);
