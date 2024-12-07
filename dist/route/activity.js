"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../common/utils");
const activity_1 = require("../service/activity");
const hono_1 = require("hono");
const app = new hono_1.Hono();
app.get("/", async (c) => {
  const claims = c.get("jwtPayload");
  const year = c.req.query("year");
  const result = await (0, activity_1.getActivities)(year, claims);
  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});
app.post("/download", async (c) => {
  const payload = await c.req.json();
  const result = await (0, activity_1.downloadActivities)(payload);
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
    `attachment; filename=Master Data Activity.csv`
  );
  return c.body((0, utils_1.toArrayBuffer)(result.data));
});
app.post("/template", async (c) => {
  const result = await (0, utils_1.downloadTemplate)(
    "src/template/activity.csv"
  );
  c.res.headers.set("Content-Type", "text/csv");
  c.res.headers.set(
    "Content-Disposition",
    `attachment; filename=Template Activity.csv`
  );
  return c.body((0, utils_1.toArrayBuffer)(result));
});
app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const result = await (0, activity_1.getActivity)(id);
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
  const result = await (0, activity_1.uploadActivity)(body["file"], claims);
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
  const result = await (0, activity_1.storeActivity)(payload, claims);
  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});
app.put("/:id", async (c) => {
  const claims = c.get("jwtPayload");
  const payload = await c.req.json();
  const id = c.req.param("id");
  const result = await (0, activity_1.updateActivity)(id, payload, claims);
  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});
app.delete("/", async (c) => {
  const claims = c.get("jwtPayload");
  const payload = await c.req.json();
  const result = await (0, activity_1.deleteActivities)(payload, claims);
  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});
app.delete("/:id", async (c) => {
  const claims = c.get("jwtPayload");
  const id = c.req.param("id");
  const result = await (0, activity_1.deleteActivity)(id, claims);
  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});
exports.default = app;
