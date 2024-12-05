import { JWT } from "@/model/jwt";
import { User } from "@/model/user";
import { sign } from "hono/jwt";

const APP_NAME = process.env.APP_NAME || "hono";
const APP_HOST = process.env.APP_HOST || "http://localhost:4000";
const JWT_DURATION = parseInt(process.env.JWT_DURATION ?? "3600");
const JWT_SECRET = process.env.JWT_SECRET || "password";

export const generateToken = async (user: User): Promise<string> => {
  const payload = generatePayload(user);

  const token = await sign(payload, JWT_SECRET);

  return token;
};

export const generatePayload = (user: User) => {
  const now = Math.floor(Date.now() / 1000); // Current Unix timestamp

  const payload: JWT = {
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
