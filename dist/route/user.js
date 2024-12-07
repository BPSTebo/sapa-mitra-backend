"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("../service/user");
const hono_1 = require("hono");
const app = new hono_1.Hono();
app.get("/", async (c) => {
  const claims = c.get("jwtPayload");
  const result = await (0, user_1.getUsers)(claims);
  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});
app.get("/me", async (c) => {
  const claims = c.get("jwtPayload");
  const result = await (0, user_1.getUser)(claims.sub);
  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});
app.post("/upload", async (c) => {
  const claims = c.get("jwtPayload");
  const body = await c.req.parseBody();
  const result = await (0, user_1.uploadUsers)(body["file"], claims);
  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});
app.put("/:id/password", async (c) => {
  const claims = c.get("jwtPayload");
  const id = c.req.param("id");
  const payload = await c.req.json();
  const result = await (0, user_1.updatePassword)(id, payload, claims);
  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});
exports.default = app;
