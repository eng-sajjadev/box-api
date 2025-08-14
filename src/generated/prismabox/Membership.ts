import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const MembershipPlain = t.Object(
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
);

export const MembershipRelations = t.Object(
  {
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
  },
  { additionalProperties: false },
);

export const MembershipPlainInputCreate = t.Object(
  {
    role: t.Optional(
      t.Union([t.Literal("OWNER"), t.Literal("ADMIN"), t.Literal("MEMBER")], {
        additionalProperties: false,
      }),
    ),
    joinedAt: t.Optional(t.Date()),
    mutedUntil: t.Optional(__nullable__(t.Date())),
    lastReadAt: t.Optional(__nullable__(t.Date())),
  },
  { additionalProperties: false },
);

export const MembershipPlainInputUpdate = t.Object(
  {
    role: t.Optional(
      t.Union([t.Literal("OWNER"), t.Literal("ADMIN"), t.Literal("MEMBER")], {
        additionalProperties: false,
      }),
    ),
    joinedAt: t.Optional(t.Date()),
    mutedUntil: t.Optional(__nullable__(t.Date())),
    lastReadAt: t.Optional(__nullable__(t.Date())),
  },
  { additionalProperties: false },
);

export const MembershipRelationsInputCreate = t.Object(
  {
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
  },
  { additionalProperties: false },
);

export const MembershipRelationsInputUpdate = t.Partial(
  t.Object(
    {
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
    },
    { additionalProperties: false },
  ),
);

export const MembershipWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          userId: t.String(),
          roomId: t.String(),
          role: t.Union(
            [t.Literal("OWNER"), t.Literal("ADMIN"), t.Literal("MEMBER")],
            { additionalProperties: false },
          ),
          joinedAt: t.Date(),
          mutedUntil: t.Date(),
          lastReadAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "Membership" },
  ),
);

export const MembershipWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            {
              id: t.String(),
              userId_roomId: t.Object(
                { userId: t.String(), roomId: t.String() },
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
              userId_roomId: t.Object(
                { userId: t.String(), roomId: t.String() },
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
              userId: t.String(),
              roomId: t.String(),
              role: t.Union(
                [t.Literal("OWNER"), t.Literal("ADMIN"), t.Literal("MEMBER")],
                { additionalProperties: false },
              ),
              joinedAt: t.Date(),
              mutedUntil: t.Date(),
              lastReadAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Membership" },
);

export const MembershipSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      userId: t.Boolean(),
      roomId: t.Boolean(),
      role: t.Boolean(),
      joinedAt: t.Boolean(),
      mutedUntil: t.Boolean(),
      lastReadAt: t.Boolean(),
      user: t.Boolean(),
      room: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const MembershipInclude = t.Partial(
  t.Object(
    {
      role: t.Boolean(),
      user: t.Boolean(),
      room: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const MembershipOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      userId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      roomId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      joinedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      mutedUntil: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      lastReadAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Membership = t.Composite([MembershipPlain, MembershipRelations], {
  additionalProperties: false,
});

export const MembershipInputCreate = t.Composite(
  [MembershipPlainInputCreate, MembershipRelationsInputCreate],
  { additionalProperties: false },
);

export const MembershipInputUpdate = t.Composite(
  [MembershipPlainInputUpdate, MembershipRelationsInputUpdate],
  { additionalProperties: false },
);
