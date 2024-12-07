"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../common/utils");
const output_1 = require("../service/output");
const hono_1 = require("hono");
const app = new hono_1.Hono();
app.post("/download", async (c) => {
  const payload = await c.req.json();
  const result = await (0, output_1.downloadOutputs)(payload);
  if (result.code != 200) {
    return c.json(
      {
        data: result.data,
        message: result.message,
      },
      result.code
    );
  }
  c.res.headers.set("Content-Type", "text/csv");
  c.res.headers.set(
    "Content-Disposition",
    `attachment; filename=Master Data Output.csv`
  );
  return c.body((0, utils_1.toArrayBuffer)(result.data));
});
app.post("/template", async (c) => {
  const result = await (0, utils_1.downloadTemplate)("src/template/output.csv");
  c.res.headers.set("Content-Type", "text/csv");
  c.res.headers.set(
    "Content-Disposition",
    `attachment; filename=Template Output.csv`
  );
  return c.body((0, utils_1.toArrayBuffer)(result));
});
app.get("/", async (c) => {
  const claims = c.get("jwtPayload");
  const year = c.req.query("year");
  const result = await (0, output_1.getOutputs)(year, claims);
  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});
app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const result = await (0, output_1.getOutput)(id);
  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});
app.post("/upload", async (c) => {
  const body = await c.req.parseBody();
  const result = await (0, output_1.uploadOutput)(body["file"]);
  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});
app.post("/", async (c) => {
  const payload = await c.req.json();
  const result = await (0, output_1.storeOutput)(payload);
  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});
app.put("/:id", async (c) => {
  const payload = await c.req.json();
  const id = c.req.param("id");
  const result = await (0, output_1.updateOutput)(id, payload);
  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});
app.delete("/", async (c) => {
  const payload = await c.req.json();
  const result = await (0, output_1.deleteOutputs)(payload);
  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});
app.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const result = await (0, output_1.deleteOutput)(id);
  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});
exports.default = app;
