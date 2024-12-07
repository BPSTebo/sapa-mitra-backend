"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configuration_1 = require("../service/configuration");
const hono_1 = require("hono");
const app = new hono_1.Hono();
app.get("/", async (c) => {
  const result = await (0, configuration_1.getConfigurations)();
  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});
app.get("/:name", async (c) => {
  const name = c.req.param("name");
  const result = await (0, configuration_1.getConfiguration)(
    name.toUpperCase()
  );
  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});
app.post("/", async (c) => {
  const claims = c.get("jwtPayload");
  const payload = await c.req.json();
  const result = await (0, configuration_1.storeConfiguration)(payload, claims);
  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});
app.put("/:name", async (c) => {
  const claims = c.get("jwtPayload");
  const payload = await c.req.json();
  const name = c.req.param("name");
  const result = await (0, configuration_1.updateConfiguration)(
    name.toUpperCase(),
    payload,
    claims
  );
  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});
app.delete("/:name", async (c) => {
  const claims = c.get("jwtPayload");
  const name = c.req.param("name");
  const result = await (0, configuration_1.deleteConfiguration)(
    name.toUpperCase(),
    claims
  );
  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});
exports.default = app;
