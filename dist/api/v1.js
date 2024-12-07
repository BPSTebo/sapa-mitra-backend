"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const auth_1 = __importDefault(require("../route/auth"));
const user_1 = __importDefault(require("../route/user"));
const activity_1 = __importDefault(require("../route/activity"));
const partner_1 = __importDefault(require("../route/partner"));
const configuration_1 = __importDefault(require("../route/configuration"));
const contract_1 = __importDefault(require("../route/contract"));
const output_1 = __importDefault(require("../route/output"));
const report_1 = __importDefault(require("../route/report"));
const app = new hono_1.Hono();
app.route("/auth", auth_1.default);
app.route("/users", user_1.default);
app.route("/outputs", output_1.default);
app.route("/activities", activity_1.default);
app.route("/partners", partner_1.default);
app.route("/configurations", configuration_1.default);
app.route("/contracts", contract_1.default);
app.route("/reports", report_1.default);
exports.default = app;
