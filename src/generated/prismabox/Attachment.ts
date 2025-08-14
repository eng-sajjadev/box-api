import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const AttachmentPlain = t.Object(
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
);

export const AttachmentRelations = t.Object(
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

export const AttachmentPlainInputCreate = t.Object(
  {
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
    name: t.Optional(__nullable__(t.String())),
    size: t.Optional(__nullable__(t.Integer())),
  },
  { additionalProperties: false },
);

export const AttachmentPlainInputUpdate = t.Object(
  {
    url: t.Optional(t.String()),
    type: t.Optional(
      t.Union(
        [
          t.Literal("IMAGE"),
          t.Literal("VIDEO"),
          t.Literal("AUDIO"),
          t.Literal("DOCUMENT"),
          t.Literal("OTHER"),
        ],
        { additionalProperties: false },
      ),
    ),
    name: t.Optional(__nullable__(t.String())),
    size: t.Optional(__nullable__(t.Integer())),
  },
  { additionalProperties: false },
);

export const AttachmentRelationsInputCreate = t.Object(
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

export const AttachmentRelationsInputUpdate = t.Partial(
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

export const AttachmentWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
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
          name: t.String(),
          size: t.Integer(),
          messageId: t.String(),
          userId: t.String(),
          createdAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "Attachment" },
  ),
);

export const AttachmentWhereUnique = t.Recursive(
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
              name: t.String(),
              size: t.Integer(),
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
  { $id: "Attachment" },
);

export const AttachmentSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      url: t.Boolean(),
      type: t.Boolean(),
      name: t.Boolean(),
      size: t.Boolean(),
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

export const AttachmentInclude = t.Partial(
  t.Object(
    {
      type: t.Boolean(),
      message: t.Boolean(),
      user: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const AttachmentOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      url: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      name: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      size: t.Union([t.Literal("asc"), t.Literal("desc")], {
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

export const Attachment = t.Composite([AttachmentPlain, AttachmentRelations], {
  additionalProperties: false,
});

export const AttachmentInputCreate = t.Composite(
  [AttachmentPlainInputCreate, AttachmentRelationsInputCreate],
  { additionalProperties: false },
);

export const AttachmentInputUpdate = t.Composite(
  [AttachmentPlainInputUpdate, AttachmentRelationsInputUpdate],
  { additionalProperties: false },
);
