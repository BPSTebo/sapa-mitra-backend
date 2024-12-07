import { CLIENT_URL, GATE_SERVICE_ID, GATE_URL, generateState } from "../common/utils.js";
import { getCookie, setCookie } from "hono/cookie";
import { login, loginSso } from "../service/auth.js";
import { Hono } from "hono";
const app = new Hono();
app.post("/login", async (c) => {
    const { email, password } = await c.req.json();
    const result = await login(email, password);
    return c.json({
        data: result.data,
        message: result.message,
    }, result.code);
});
app.get("/sso", async (c) => {
    const state = generateState();
    setCookie(c, "state", state, {
        expires: new Date(Date.now() + 300 * 1000),
        httpOnly: true,
        maxAge: 300,
        path: "/",
        secure: true,
        sameSite: "Lax",
    });
    return c.redirect(`${GATE_URL}/api/v1/auth/sso?state=${state}&service_id=${GATE_SERVICE_ID}`);
});
app.get("/callback", async (c) => {
    const state = c.req.query("state");
    const token = c.req.query("token");
    const cookieState = getCookie(c, "state");
    if (!cookieState) {
        return c.redirect(CLIENT_URL + "/masuk?error=state_not_found");
    }
    if (cookieState !== state) {
        return c.redirect(CLIENT_URL + "/masuk?error=invalid_state");
    }
    if (!token) {
        return c.redirect(CLIENT_URL + "/masuk?error=token_not_found");
    }
    const result = await loginSso(token);
    if (result.code != 200) {
        return c.redirect(CLIENT_URL + "/masuk?error=user_not_found");
    }
    return c.redirect(CLIENT_URL + "/masuk?token=" + result.data.token);
});
export default app;
