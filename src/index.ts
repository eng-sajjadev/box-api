import { logger } from "@tqman/nice-logger";
import { Elysia } from "elysia";
import auth from "./lib/plugins/auth";
import contact from "./lib/plugins/contact";
import room from "./lib/plugins/room";
import message from "./lib/plugins/message";
import swagger from "@elysiajs/swagger";

const app = new Elysia({ prefix: "/api/v1" })
  .use(
    logger({
      mode: "live", // "live" or "combined" (default: "combined")
      withTimestamp: true, // optional (default: false)
    })
  )
  .use(swagger())
  .use(auth)
  .use(contact)
  .use(room)
  .use(message)
  .get("/", () => "Hello Elysia")
  .listen(process.env.PORT ?? 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
