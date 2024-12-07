"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../common/utils");
const cookie_1 = require("hono/cookie");
const auth_1 = require("../service/auth");
const hono_1 = require("hono");
const app = new hono_1.Hono();
app.post("/login", async (c) => {
  const { email, password } = await c.req.json();
  const result = await (0, auth_1.login)(email, password);
  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});
app.get("/sso", async (c) => {
  const state = (0, utils_1.generateState)();
  (0, cookie_1.setCookie)(c, "state", state, {
    expires: new Date(Date.now() + 300 * 1000),
    httpOnly: true,
    maxAge: 300,
    path: "/",
    secure: true,
    sameSite: "Lax",
  });
  return c.redirect(
    `${utils_1.GATE_URL}/api/v1/auth/sso?state=${state}&service_id=${utils_1.GATE_SERVICE_ID}`
  );
});
app.get("/callback", async (c) => {
  const state = c.req.query("state");
  const token = c.req.query("token");
  const cookieState = (0, cookie_1.getCookie)(c, "state");
  if (!cookieState) {
    return c.redirect(utils_1.CLIENT_URL + "/masuk?error=state_not_found");
  }
  if (cookieState !== state) {
    return c.redirect(utils_1.CLIENT_URL + "/masuk?error=invalid_state");
  }
  if (!token) {
    return c.redirect(utils_1.CLIENT_URL + "/masuk?error=token_not_found");
  }
  const result = await (0, auth_1.loginSso)(token);
  if (result.code != 200) {
    return c.redirect(utils_1.CLIENT_URL + "/masuk?error=user_not_found");
  }
  return c.redirect(utils_1.CLIENT_URL + "/masuk?token=" + result.data.token);
});
exports.default = app;
