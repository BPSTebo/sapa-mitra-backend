import { downloadTemplate, toArrayBuffer } from "../common/utils.js";
import { deletePartner, getPartners, getPartner, storePartner, updatePartner, uploadPartner, deletePartners, downloadPartner, } from "../service/partner.js";
import { Hono } from "hono";
const app = new Hono();
app.post("/template", async (c) => {
    const result = await downloadTemplate("src/template/partner.csv");
    c.res.headers.set("Content-Type", "text/csv");
    c.res.headers.set("Content-Disposition", `attachment; filename=Template Partner.csv`);
    return c.body(toArrayBuffer(result));
});
app.post("/download", async (c) => {
    const result = await downloadPartner();
    if (result.code != 200) {
        return c.json({
            data: result.data,
            message: result.code,
        }, result.code);
    }
    c.res.headers.set("Content-Type", "text/csv");
    c.res.headers.set("Content-Disposition", `attachment; filename=Master Data Partner.csv`);
    return c.body(toArrayBuffer(result.data));
});
app.get("/", async (c) => {
    const year = c.req.query("year");
    const result = await getPartners(year);
    return c.json({
        data: result.data,
        message: result.message,
    }, result.code);
});
app.get("/:id", async (c) => {
    const id = c.req.param("id");
    const result = await getPartner(id);
    return c.json({
        data: result.data,
        message: result.message,
    }, result.code);
});
app.post("/upload", async (c) => {
    const claims = c.get("jwtPayload");
    const body = await c.req.parseBody();
    const result = await uploadPartner(body["file"], claims);
    return c.json({
        data: result.data,
        message: result.message,
    }, result.code);
});
app.post("/", async (c) => {
    const claims = c.get("jwtPayload");
    const payload = await c.req.json();
    const result = await storePartner(payload, claims);
    return c.json({
        data: result.data,
        message: result.message,
    }, result.code);
});
app.put("/:id", async (c) => {
    const claims = c.get("jwtPayload");
    const payload = await c.req.json();
    const id = c.req.param("id");
    const result = await updatePartner(id, payload, claims);
    return c.json({
        data: result.data,
        message: result.message,
    }, result.code);
});
app.delete("/:id", async (c) => {
    const claims = c.get("jwtPayload");
    const id = c.req.param("id");
    const result = await deletePartner(id, claims);
    return c.json({
        data: result.data,
        message: result.message,
    }, result.code);
});
app.delete("/", async (c) => {
    const claims = c.get("jwtPayload");
    const payload = await c.req.json();
    const result = await deletePartners(payload, claims);
    return c.json({
        data: result.data,
        message: result.message,
    }, result.code);
});
export default app;
