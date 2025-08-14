import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const UserPlain = t.Object(
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
);

export const UserRelations = t.Object(
  {
    contacts: t.Array(
      t.Object(
        {
          id: t.String(),
          userId: t.String(),
          contactId: t.String(),
          name: __nullable__(t.String()),
          createdAt: t.Date(),
        },
        { additionalProperties: false },
      ),
      { additionalProperties: false },
    ),
    contactOf: t.Array(
      t.Object(
        {
          id: t.String(),
          userId: t.String(),
          contactId: t.String(),
          name: __nullable__(t.String()),
          createdAt: t.Date(),
        },
        { additionalProperties: false },
      ),
      { additionalProperties: false },
    ),
    sentMessages: t.Array(
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
    receivedMessages: t.Array(
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
    memberships: t.Array(
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
    ownedRooms: t.Array(
      t.Object(
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
    notifications: t.Array(
      t.Object(
        {
          id: t.String(),
          userId: t.String(),
          type: t.Union(
            [
              t.Literal("MESSAGE"),
              t.Literal("MENTION"),
              t.Literal("INVITATION"),
              t.Literal("SYSTEM"),
            ],
            { additionalProperties: false },
          ),
          title: t.String(),
          body: t.String(),
          data: __nullable__(t.Any()),
          read: t.Boolean(),
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
  },
  { additionalProperties: false },
);

export const UserPlainInputCreate = t.Object(
  {
    email: t.Optional(__nullable__(t.String())),
    phone: t.Optional(__nullable__(t.String())),
    password: t.String(),
    username: t.String(),
    avatar: t.Optional(__nullable__(t.String())),
    status: t.Optional(__nullable__(t.String())),
    lastSeen: t.Optional(__nullable__(t.Date())),
    bio: t.Optional(__nullable__(t.String())),
    verified: t.Optional(t.Boolean()),
    verificationCode: t.Optional(__nullable__(t.String())),
    verificationCodeExpires: t.Optional(__nullable__(t.Date())),
  },
  { additionalProperties: false },
);

export const UserPlainInputUpdate = t.Object(
  {
    email: t.Optional(__nullable__(t.String())),
    phone: t.Optional(__nullable__(t.String())),
    password: t.Optional(t.String()),
    username: t.Optional(t.String()),
    avatar: t.Optional(__nullable__(t.String())),
    status: t.Optional(__nullable__(t.String())),
    lastSeen: t.Optional(__nullable__(t.Date())),
    bio: t.Optional(__nullable__(t.String())),
    verified: t.Optional(t.Boolean()),
    verificationCode: t.Optional(__nullable__(t.String())),
    verificationCodeExpires: t.Optional(__nullable__(t.Date())),
  },
  { additionalProperties: false },
);

export const UserRelationsInputCreate = t.Object(
  {
    contacts: t.Optional(
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
    contactOf: t.Optional(
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
    sentMessages: t.Optional(
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
    receivedMessages: t.Optional(
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
    memberships: t.Optional(
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
    ownedRooms: t.Optional(
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
    notifications: t.Optional(
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
  },
  { additionalProperties: false },
);

export const UserRelationsInputUpdate = t.Partial(
  t.Object(
    {
      contacts: t.Partial(
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
      contactOf: t.Partial(
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
      sentMessages: t.Partial(
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
      receivedMessages: t.Partial(
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
      memberships: t.Partial(
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
      ownedRooms: t.Partial(
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
      notifications: t.Partial(
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
    },
    { additionalProperties: false },
  ),
);

export const UserWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          email: t.String(),
          phone: t.String(),
          password: t.String(),
          username: t.String(),
          avatar: t.String(),
          status: t.String(),
          lastSeen: t.Date(),
          bio: t.String(),
          verified: t.Boolean(),
          verificationCode: t.String(),
          verificationCodeExpires: t.Date(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "User" },
  ),
);

export const UserWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            {
              id: t.String(),
              email: t.String(),
              phone: t.String(),
              username: t.String(),
            },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [
            t.Object({ id: t.String() }),
            t.Object({ email: t.String() }),
            t.Object({ phone: t.String() }),
            t.Object({ username: t.String() }),
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
              email: t.String(),
              phone: t.String(),
              password: t.String(),
              username: t.String(),
              avatar: t.String(),
              status: t.String(),
              lastSeen: t.Date(),
              bio: t.String(),
              verified: t.Boolean(),
              verificationCode: t.String(),
              verificationCodeExpires: t.Date(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "User" },
);

export const UserSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      email: t.Boolean(),
      phone: t.Boolean(),
      password: t.Boolean(),
      username: t.Boolean(),
      avatar: t.Boolean(),
      status: t.Boolean(),
      lastSeen: t.Boolean(),
      bio: t.Boolean(),
      verified: t.Boolean(),
      verificationCode: t.Boolean(),
      verificationCodeExpires: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      contacts: t.Boolean(),
      contactOf: t.Boolean(),
      sentMessages: t.Boolean(),
      receivedMessages: t.Boolean(),
      memberships: t.Boolean(),
      ownedRooms: t.Boolean(),
      reactions: t.Boolean(),
      notifications: t.Boolean(),
      attachments: t.Boolean(),
      pinnedMessages: t.Boolean(),
      readReceipts: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const UserInclude = t.Partial(
  t.Object(
    {
      contacts: t.Boolean(),
      contactOf: t.Boolean(),
      sentMessages: t.Boolean(),
      receivedMessages: t.Boolean(),
      memberships: t.Boolean(),
      ownedRooms: t.Boolean(),
      reactions: t.Boolean(),
      notifications: t.Boolean(),
      attachments: t.Boolean(),
      pinnedMessages: t.Boolean(),
      readReceipts: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const UserOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      email: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      phone: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      password: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      username: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      avatar: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      status: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      lastSeen: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      bio: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      verified: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      verificationCode: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      verificationCodeExpires: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      updatedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const User = t.Composite([UserPlain, UserRelations], {
  additionalProperties: false,
});

export const UserInputCreate = t.Composite(
  [UserPlainInputCreate, UserRelationsInputCreate],
  { additionalProperties: false },
);

export const UserInputUpdate = t.Composite(
  [UserPlainInputUpdate, UserRelationsInputUpdate],
  { additionalProperties: false },
);
