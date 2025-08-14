import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const MessageStatus = t.Union(
  [
    t.Literal("SENT"),
    t.Literal("DELIVERED"),
    t.Literal("READ"),
    t.Literal("FAILED"),
  ],
  { additionalProperties: false },
);
