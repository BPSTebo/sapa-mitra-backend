import { downloadTemplate, toArrayBuffer } from "../common/utils.js";
import { deleteOutput, getOutputs, getOutput, storeOutput, updateOutput, uploadOutput, deleteOutputs, downloadOutputs, } from "../service/output.js";
import { Hono } from "hono";
const app = new Hono();
app.post("/download", async (c) => {
    const payload = await c.req.json();
    const result = await downloadOutputs(payload);
    if (result.code != 200) {
        return c.json({
            data: result.data,
            message: result.message,
        }, result.code);
    }
    c.res.headers.set("Content-Type", "text/csv");
    c.res.headers.set("Content-Disposition", `attachment; filename=Master Data Output.csv`);
    return c.body(toArrayBuffer(result.data));
});
app.post("/template", async (c) => {
    const result = await downloadTemplate("src/template/output.csv");
    c.res.headers.set("Content-Type", "text/csv");
    c.res.headers.set("Content-Disposition", `attachment; filename=Template Output.csv`);
    return c.body(toArrayBuffer(result));
});
app.get("/", async (c) => {
    const claims = c.get("jwtPayload");
    const year = c.req.query("year");
    const result = await getOutputs(year, claims);
    return c.json({
        data: result.data,
        message: result.message,
    }, result.code);
});
app.get("/:id", async (c) => {
    const id = c.req.param("id");
    const result = await getOutput(id);
    return c.json({
        data: result.data,
        message: result.message,
    }, result.code);
});
app.post("/upload", async (c) => {
    const body = await c.req.parseBody();
    const result = await uploadOutput(body["file"]);
    return c.json({
        data: result.data,
        message: result.message,
    }, result.code);
});
app.post("/", async (c) => {
    const payload = await c.req.json();
    const result = await storeOutput(payload);
    return c.json({
        data: result.data,
        message: result.message,
    }, result.code);
});
app.put("/:id", async (c) => {
    const payload = await c.req.json();
    const id = c.req.param("id");
    const result = await updateOutput(id, payload);
    return c.json({
        data: result.data,
        message: result.message,
    }, result.code);
});
app.delete("/", async (c) => {
    const payload = await c.req.json();
    const result = await deleteOutputs(payload);
    return c.json({
        data: result.data,
        message: result.message,
    }, result.code);
});
app.delete("/:id", async (c) => {
    const id = c.req.param("id");
    const result = await deleteOutput(id);
    return c.json({
        data: result.data,
        message: result.message,
    }, result.code);
});
export default app;
