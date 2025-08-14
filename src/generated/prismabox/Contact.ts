import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const ContactPlain = t.Object(
  {
    id: t.String(),
    userId: t.String(),
    contactId: t.String(),
    name: __nullable__(t.String()),
    createdAt: t.Date(),
  },
  { additionalProperties: false },
);

export const ContactRelations = t.Object(
  {
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
    contactUser: t.Object(
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

export const ContactPlainInputCreate = t.Object(
  { name: t.Optional(__nullable__(t.String())) },
  { additionalProperties: false },
);

export const ContactPlainInputUpdate = t.Object(
  { name: t.Optional(__nullable__(t.String())) },
  { additionalProperties: false },
);

export const ContactRelationsInputCreate = t.Object(
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
    contactUser: t.Object(
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

export const ContactRelationsInputUpdate = t.Partial(
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
      contactUser: t.Object(
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

export const ContactWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          userId: t.String(),
          contactId: t.String(),
          name: t.String(),
          createdAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "Contact" },
  ),
);

export const ContactWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            {
              id: t.String(),
              userId_contactId: t.Object(
                { userId: t.String(), contactId: t.String() },
                { additionalProperties: false },
              ),
              userId_name: t.Object(
                { userId: t.String(), name: t.String() },
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
              userId_contactId: t.Object(
                { userId: t.String(), contactId: t.String() },
                { additionalProperties: false },
              ),
            }),
            t.Object({
              userId_name: t.Object(
                { userId: t.String(), name: t.String() },
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
              contactId: t.String(),
              name: t.String(),
              createdAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Contact" },
);

export const ContactSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      userId: t.Boolean(),
      contactId: t.Boolean(),
      name: t.Boolean(),
      createdAt: t.Boolean(),
      user: t.Boolean(),
      contactUser: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const ContactInclude = t.Partial(
  t.Object(
    { user: t.Boolean(), contactUser: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const ContactOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      userId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      contactId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      name: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Contact = t.Composite([ContactPlain, ContactRelations], {
  additionalProperties: false,
});

export const ContactInputCreate = t.Composite(
  [ContactPlainInputCreate, ContactRelationsInputCreate],
  { additionalProperties: false },
);

export const ContactInputUpdate = t.Composite(
  [ContactPlainInputUpdate, ContactRelationsInputUpdate],
  { additionalProperties: false },
);
