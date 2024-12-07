"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../common/utils");
const partner_1 = require("../service/partner");
const hono_1 = require("hono");
const app = new hono_1.Hono();
app.post("/template", async (c) => {
  const result = await (0, utils_1.downloadTemplate)(
    "src/template/partner.csv"
  );
  c.res.headers.set("Content-Type", "text/csv");
  c.res.headers.set(
    "Content-Disposition",
    `attachment; filename=Template Partner.csv`
  );
  return c.body((0, utils_1.toArrayBuffer)(result));
});
app.post("/download", async (c) => {
  const result = await (0, partner_1.downloadPartner)();
  if (result.code != 200) {
    return c.json(
      {
        data: result.data,
        message: result.code,
      },
      result.code
    );
  }
  c.res.headers.set("Content-Type", "text/csv");
  c.res.headers.set(
    "Content-Disposition",
    `attachment; filename=Master Data Partner.csv`
  );
  return c.body((0, utils_1.toArrayBuffer)(result.data));
});
app.get("/", async (c) => {
  const year = c.req.query("year");
  const result = await (0, partner_1.getPartners)(year);
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
  const result = await (0, partner_1.getPartner)(id);
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
  const result = await (0, partner_1.uploadPartner)(body["file"], claims);
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
  const result = await (0, partner_1.storePartner)(payload, claims);
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
  const result = await (0, partner_1.updatePartner)(id, payload, claims);
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
  const result = await (0, partner_1.deletePartner)(id, claims);
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
  const result = await (0, partner_1.deletePartners)(payload, claims);
  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});
exports.default = app;
