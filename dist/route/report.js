"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../common/utils");
const report_1 = require("../service/report");
const hono_1 = require("hono");
const app = new hono_1.Hono();
app.post("/partner/template", async (c) => {
  const result = await (0, utils_1.downloadTemplate)(
    "src/template/partner-in-report.csv"
  );
  c.res.headers.set("Content-Type", "text/csv");
  c.res.headers.set(
    "Content-Disposition",
    `attachment; filename=Template Partner in Report.csv`
  );
  return c.body((0, utils_1.toArrayBuffer)(result));
});
app.post("/:id/print", async (c) => {
  const claims = c.get("jwtPayload");
  const id = c.req.param("id");
  const result = await (0, report_1.printReport)(id, claims);
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
app.post("/print", async (c) => {
  const claims = c.get("jwtPayload");
  const payload = await c.req.json();
  const result = await (0, report_1.printReports)(payload, claims);
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
    `attachment; filename=BAST ${new Date().valueOf()}.pdf`
  );
  return c.body((0, utils_1.toArrayBuffer)(result.data));
});
app.get("/", async (c) => {
  const period = c.req.query("period");
  const result = await (0, report_1.getReports)(period);
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
  const result = await (0, report_1.getReport)(id);
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
  const result = await (0, report_1.deleteReport)(id);
  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});
app.delete("/:id/output/:outputId", async (c) => {
  const id = c.req.param("id");
  const outputId = c.req.param("outputId");
  const result = await (0, report_1.deleteReportOutput)(id, outputId);
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
  if (by == "output") {
    result = await (0, report_1.storeReportByOutput)(payload, claims);
  } else {
    result = await (0, report_1.storeReport)(payload, claims);
  }
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
  const result = await (0, report_1.downloadReports)(payload);
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
exports.default = app;
