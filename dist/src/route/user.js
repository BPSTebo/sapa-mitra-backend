import { getUsers, getUser, uploadUsers, updatePassword } from "../service/user.js";
import { Hono } from "hono";
const app = new Hono();
app.get("/", async (c) => {
    const claims = c.get("jwtPayload");
    const result = await getUsers(claims);
    return c.json({
        data: result.data,
        message: result.message,
    }, result.code);
});
app.get("/me", async (c) => {
    const claims = c.get("jwtPayload");
    const result = await getUser(claims.sub);
    return c.json({
        data: result.data,
        message: result.message,
    }, result.code);
});
app.post("/upload", async (c) => {
    const claims = c.get("jwtPayload");
    const body = await c.req.parseBody();
    const result = await uploadUsers(body["file"], claims);
    return c.json({
        data: result.data,
        message: result.message,
    }, result.code);
});
app.put("/:id/password", async (c) => {
    const claims = c.get("jwtPayload");
    const id = c.req.param("id");
    const payload = await c.req.json();
    const result = await updatePassword(id, payload, claims);
    return c.json({
        data: result.data,
        message: result.message,
    }, result.code);
});
export default app;
