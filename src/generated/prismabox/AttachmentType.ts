import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const AttachmentType = t.Union(
  [
    t.Literal("IMAGE"),
    t.Literal("VIDEO"),
    t.Literal("AUDIO"),
    t.Literal("DOCUMENT"),
    t.Literal("OTHER"),
  ],
  { additionalProperties: false },
);
