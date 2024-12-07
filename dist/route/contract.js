"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../common/utils");
const contract_1 = require("../service/contract");
const hono_1 = require("hono");
const app = new hono_1.Hono();
app.post("/:id/print", async (c) => {
  const claims = c.get("jwtPayload");
  const id = c.req.param("id");
  const result = await (0, contract_1.printContract)(id, claims);
  if (result.code != 200) {
    return c.json(
      {
        data: result.data,
        message: result.message,
      },
      result.code
    );
  }
  c.res.headers.set("Content-Type", "application/pdf");
  c.res.headers.set(
    "Content-Disposition",
    `attachment; filename="${result.data.fileName}.pdf"`
  );
  return c.body((0, utils_1.toArrayBuffer)(result.data.file));
});
app.post("/partner/template", async (c) => {
  const result = await (0, utils_1.downloadTemplate)(
    "src/template/partner-in-contract.csv"
  );
  c.res.headers.set("Content-Type", "text/csv");
  c.res.headers.set(
    "Content-Disposition",
    `attachment; filename=Template Partner in Contract.csv`
  );
  return c.body((0, utils_1.toArrayBuffer)(result));
});
app.post("/download", async (c) => {
  const payload = await c.req.json();
  const result = await (0, contract_1.downloadContracts)(payload);
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
    `attachment; filename=Master Data Contract.csv`
  );
  return c.body((0, utils_1.toArrayBuffer)(result.data));
});
app.post("/print", async (c) => {
  const claims = c.get("jwtPayload");
  const payload = await c.req.json();
  const result = await (0, contract_1.printContracts)(payload, claims);
  if (result.code != 200) {
    return c.json(
      {
        data: result.data,
        message: result.message,
      },
      result.code
    );
  }
  c.res.headers.set("Content-Type", "application/pdf");
  c.res.headers.set(
    "Content-Disposition",
    `attachment; filename=SPK ${new Date().valueOf()}.pdf`
  );
  return c.body((0, utils_1.toArrayBuffer)(result.data));
});
app.get("/statistics", async (c) => {
  const year = c.req.query("year");
  const result = await (0, contract_1.getContractStatistics)(year);
  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});
app.get("/", async (c) => {
  const claims = c.get("jwtPayload");
  const period = c.req.query("period");
  const status = c.req.query("status");
  const result = await (0, contract_1.getContracts)(period, status, claims);
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
  const result = await (0, contract_1.getContract)(id);
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
  const by = c.req.query("by");
  const payload = await c.req.json();
  let result;
  if (by == "activity") {
    result = await (0, contract_1.storeContractByActivity)(payload, claims);
  } else {
    result = await (0, contract_1.storeContract)(payload, claims);
  }
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
  const id = c.req.param("id");
  const payload = await c.req.json();
  const result = await (0, contract_1.updateContract)(id, payload, claims);
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
  const result = await (0, contract_1.deletContract)(id);
  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});
app.get("/:id/activity/:activityId", async (c) => {
  const claims = c.get("jwtPayload");
  const id = c.req.param("id");
  const activityId = c.req.param("activityId");
  const result = await (0, contract_1.getContractActivity)(
    id,
    activityId,
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
app.put("/:id/activity/:activityId", async (c) => {
  const claims = c.get("jwtPayload");
  const id = c.req.param("id");
  const payload = await c.req.json();
  const activityId = c.req.param("activityId");
  const result = await (0, contract_1.updateContractActivity)(
    id,
    activityId,
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
app.delete("/:id/activity/:activityId", async (c) => {
  const claims = c.get("jwtPayload");
  const id = c.req.param("id");
  const activityId = c.req.param("activityId");
  const result = await (0, contract_1.deleteContractActivity)(
    id,
    activityId,
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
app.get("/:id/activity/:activityId/verify", async (c) => {
  const claims = c.get("jwtPayload");
  const id = c.req.param("id");
  const activityId = c.req.param("activityId");
  const result = await (0, contract_1.verifyContractActivity)(
    id,
    activityId,
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
app.get("/:id/activity/:activityId/cancel", async (c) => {
  const claims = c.get("jwtPayload");
  const id = c.req.param("id");
  const activityId = c.req.param("activityId");
  const result = await (0, contract_1.cancelContractActivity)(
    id,
    activityId,
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
app.get("/activity/volume", async (c) => {
  const outputId = c.req.query("outputId");
  const period = c.req.query("period");
  const result = await (0, contract_1.getContractActivityVolume)(
    period,
    outputId
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
