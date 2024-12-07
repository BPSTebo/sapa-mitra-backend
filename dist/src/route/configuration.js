import { deleteConfiguration, getConfigurations, getConfiguration, storeConfiguration, updateConfiguration, } from "../service/configuration.js";
import { Hono } from "hono";
const app = new Hono();
app.get("/", async (c) => {
    const result = await getConfigurations();
    return c.json({
        data: result.data,
        message: result.message,
    }, result.code);
});
app.get("/:name", async (c) => {
    const name = c.req.param("name");
    const result = await getConfiguration(name.toUpperCase());
    return c.json({
        data: result.data,
        message: result.message,
    }, result.code);
});
app.post("/", async (c) => {
    const claims = c.get("jwtPayload");
    const payload = await c.req.json();
    const result = await storeConfiguration(payload, claims);
    return c.json({
        data: result.data,
        message: result.message,
    }, result.code);
});
app.put("/:name", async (c) => {
    const claims = c.get("jwtPayload");
    const payload = await c.req.json();
    const name = c.req.param("name");
    const result = await updateConfiguration(name.toUpperCase(), payload, claims);
    return c.json({
        data: result.data,
        message: result.message,
    }, result.code);
});
app.delete("/:name", async (c) => {
    const claims = c.get("jwtPayload");
    const name = c.req.param("name");
    const result = await deleteConfiguration(name.toUpperCase(), claims);
    return c.json({
        data: result.data,
        message: result.message,
    }, result.code);
});
export default app;
