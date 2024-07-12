import { downloadTemplate, toArrayBuffer } from "@/common/utils";
import { OutputPayload } from "@/model/output";
import {
  deleteOutput,
  getOutputs,
  getOutput,
  storeOutput,
  updateOutput,
  uploadOutput,
  deleteOutputs,
} from "@/service/output";
import { Hono } from "hono";

const app = new Hono();

app.post("/template", async (c) => {
  const result = await downloadTemplate("src/template/output.csv");

  c.res.headers.set("Content-Type", "text/csv");
  c.res.headers.set(
    "Content-Disposition",
    `attachment; filename=Template Output.csv`
  );

  return c.body(toArrayBuffer(result));
});

app.get("/", async (c) => {
  const result = await getOutputs();

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
  const result = await getOutput(id);

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

  const result = await uploadOutput(body["file"] as File);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

app.post("/", async (c) => {
  const payload = await c.req.json<OutputPayload>();

  const result = await storeOutput(payload);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

app.put("/:id", async (c) => {
  const payload = await c.req.json<OutputPayload>();
  const id = c.req.param("id");
  const result = await updateOutput(id, payload);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

app.delete("/", async (c) => {
  const payload = await c.req.json<string[]>();
  const result = await deleteOutputs(payload);

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
  const result = await deleteOutput(id);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

export default app;
