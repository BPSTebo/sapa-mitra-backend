import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { etag } from "hono/etag";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import apiV1 from "@/api/v1";
import connectDB from "@/config/db";
import withAuth from "@/middleware/withAuth";

require("dotenv").config();

const app = new Hono();

connectDB();

app.use(prettyJSON());
app.use(cors());
app.use(etag(), logger());
app.use("/static/*", serveStatic({ root: "./" }));
app.get("/", (c) =>
  c.text(
    `${process.env.APP_NAME} ${process.env.APP_ENV} API`.toUpperCase() +
      ` (Build: ${process.env.APP_BUILD_HASH})`
  )
);
app.get("/health", (c) => c.json("OK"));
app.use("/v1/*", withAuth);

app.notFound((c) => {
  return c.json(
    {
      message: "invalid endpoint",
      data: null,
    },
    404
  );
});

app.onError((err, c) => {
  return c.json(
    {
      message: err.message,
      data: null,
    },
    500
  );
});

app.route("/v1", apiV1);

serve({
  port: 4000,
  fetch: app.fetch,
});
