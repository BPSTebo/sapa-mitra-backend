import { jwt } from "hono/jwt";
import { createMiddleware } from "hono/factory";
import { publicRoute } from "../config/route.js";
import { isProduction } from "../common/utils.js";
import UserSchema from "../schema/user.js";
import { generatePayload } from "../service/jwt.js";
const withAuth = createMiddleware(async (c, next) => {
    const isPublicRoute = publicRoute.some((route) => route.path === c.req.path && route.method === c.req.method);
    if (isPublicRoute) {
        return next();
    }
    if (!isProduction && !c.req.header("Authorization")) {
        const user = await UserSchema.findOne();
        if (!user) {
            return;
        }
        const payload = generatePayload(user);
        c.set("jwtPayload", payload);
        return next();
    }
    const jwtMiddleware = jwt({
        secret: process.env.JWT_SECRET || "password",
    });
    return jwtMiddleware(c, next);
});
export default withAuth;
