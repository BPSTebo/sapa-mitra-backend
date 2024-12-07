"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_1 = require("hono/jwt");
const factory_1 = require("hono/factory");
const route_1 = require("../config/route");
const utils_1 = require("../common/utils");
const user_1 = __importDefault(require("../schema/user"));
const jwt_2 = require("../service/jwt");
const withAuth = (0, factory_1.createMiddleware)(async (c, next) => {
  const isPublicRoute = route_1.publicRoute.some(
    (route) => route.path === c.req.path && route.method === c.req.method
  );
  if (isPublicRoute) {
    return next();
  }
  if (!utils_1.isProduction && !c.req.header("Authorization")) {
    const user = await user_1.default.findOne();
    if (!user) {
      return;
    }
    const payload = (0, jwt_2.generatePayload)(user);
    c.set("jwtPayload", payload);
    return next();
  }
  const jwtMiddleware = (0, jwt_1.jwt)({
    secret: process.env.JWT_SECRET || "password",
  });
  return jwtMiddleware(c, next);
});
exports.default = withAuth;
