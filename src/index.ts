import { logger } from "@tqman/nice-logger";
import { Elysia } from "elysia";
import auth from "./lib/plugins/auth";

const app = new Elysia({ prefix: "/api/v1" })
  .use(
    logger({
      mode: "live", // "live" or "combined" (default: "combined")
      withTimestamp: true, // optional (default: false)
    })
  )
  .use(auth)
  .get("/", () => "Hello Elysia")
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
