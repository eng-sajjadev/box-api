import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const RoomType = t.Union(
  [t.Literal("PRIVATE"), t.Literal("GROUP"), t.Literal("CHANNEL")],
  { additionalProperties: false },
);
