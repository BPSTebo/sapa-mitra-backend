import { downloadTemplate, toArrayBuffer } from "@/common/utils";
import { ContractActivityPayload } from "@/model/contract";
import {
  cancelContractActivity,
  deletContract,
  deleteContractActivity,
  downloadContracts,
  getContract,
  getContractActivity,
  getContractStatistics,
  getContracts,
  printContract,
  printContracts,
  storeContract,
  storeContractByActivity,
  updateContractActivity,
  verifyContractActivity,
} from "@/service/contract";
import { Hono } from "hono";

const app = new Hono();

app.post("/:id/print", async (c) => {
  const claims = c.get("jwtPayload");
  const id = c.req.param("id");

  const result = await printContract(id, claims);

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

  return c.body(toArrayBuffer(result.data.file));
});

app.post("/partner/template", async (c) => {
  const result = await downloadTemplate("src/template/partner-in-contract.csv");

  c.res.headers.set("Content-Type", "text/csv");
  c.res.headers.set(
    "Content-Disposition",
    `attachment; filename=Template Partner in Contract.csv`
  );

  return c.body(toArrayBuffer(result));
});

app.post("/download", async (c) => {
  const payload = await c.req.json<string[]>();
  const result = await downloadContracts(payload);

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
    `attachment; filename=Master Data Contract.csv`
  );

  return c.body(toArrayBuffer(result.data));
});

app.post("/print", async (c) => {
  const claims = c.get("jwtPayload");
  const payload = await c.req.json<string[]>();

  const result = await printContracts(payload, claims);

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

  return c.body(toArrayBuffer(result.data));
});

app.get("/statistics", async (c) => {
  const result = await getContractStatistics();

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

  const result = await getContracts(period, status, claims);

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

  const result = await getContract(id);

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
    result = await storeContractByActivity(payload, claims);
  } else {
    result = await storeContract(payload, claims);
  }

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

  const result = await deletContract(id);

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

  const result = await getContractActivity(id, activityId, claims);

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
  const payload = await c.req.json<ContractActivityPayload>();
  const activityId = c.req.param("activityId");

  const result = await updateContractActivity(id, activityId, payload, claims);

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

  const result = await deleteContractActivity(id, activityId, claims);

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

  const result = await verifyContractActivity(id, activityId, claims);

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

  const result = await cancelContractActivity(id, activityId, claims);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

export default app;
