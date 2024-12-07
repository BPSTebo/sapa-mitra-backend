"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const node_server_1 = require("@hono/node-server");
const hono_1 = require("hono");
const serve_static_1 = require("@hono/node-server/serve-static");
const etag_1 = require("hono/etag");
const logger_1 = require("hono/logger");
const cors_1 = require("hono/cors");
const pretty_json_1 = require("hono/pretty-json");
const v1_1 = __importDefault(require("./api/v1"));
const db_1 = __importDefault(require("./config/db"));
const withAuth_1 = __importDefault(require("./middleware/withAuth"));
require("dotenv").config();
const app = new hono_1.Hono();
(0, db_1.default)();
app.use((0, pretty_json_1.prettyJSON)());
app.use((0, cors_1.cors)());
app.use((0, etag_1.etag)(), (0, logger_1.logger)());
app.use("/static/*", (0, serve_static_1.serveStatic)({ root: "./" }));
app.get("/", (c) =>
  c.text(
    `${process.env.APP_NAME} ${process.env.APP_ENV} API`.toUpperCase() +
      ` (Build: ${process.env.APP_BUILD_HASH})`
  )
);
app.get("/health", (c) => c.json("OK"));
app.use("/v1/*", withAuth_1.default);
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
app.route("/v1", v1_1.default);
(0, node_server_1.serve)({
  port: 4000,
  fetch: app.fetch,
});
