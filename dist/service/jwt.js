"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePayload = exports.generateToken = void 0;
const jwt_1 = require("hono/jwt");
const APP_NAME = process.env.APP_NAME || "hono";
const APP_HOST = process.env.APP_HOST || "http://localhost:4000";
const JWT_DURATION = parseInt(process.env.JWT_DURATION ?? "3600");
const JWT_SECRET = process.env.JWT_SECRET || "password";
const generateToken = async (user) => {
    const payload = (0, exports.generatePayload)(user);
    const token = await (0, jwt_1.sign)(payload, JWT_SECRET);
    return token;
};
exports.generateToken = generateToken;
const generatePayload = (user) => {
    const now = Math.floor(Date.now() / 1000); // Current Unix timestamp
    const payload = {
        iss: APP_HOST,
        aud: APP_NAME,
        sub: user.id,
        name: user.name,
        nip: user.nip,
        email: user.email,
        team: user.team,
        position: user.position,
        exp: now + JWT_DURATION, // Token expires in 5 minutes
        nbf: now, // Token is not valid before the current time
        iat: now, // Token was issued at the current time
    };
    return payload;
};
exports.generatePayload = generatePayload;
