"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSso = exports.login = void 0;
const user_1 = __importDefault(require("../schema/user"));
const jwt_1 = require("../service/jwt");
const sso_1 = require("../service/sso");
const bcrypt_1 = __importDefault(require("bcrypt"));
const login = async (email, password) => {
  const user = await user_1.default.findOne({ email });
  if (!user) {
    return {
      data: null,
      message: "User not found",
      code: 404,
    };
  }
  const { password: hashedPassword, ...restUser } = user.toObject(); // Convert the document to a plain object
  const isMatch = await bcrypt_1.default.compare(password, hashedPassword);
  if (!isMatch) {
    return {
      data: null,
      message: "Invalid credential",
      code: 400,
    };
  }
  const token = await (0, jwt_1.generateToken)(user);
  const result = {
    token: token,
  };
  return {
    data: result,
    message: "Successfully logged in",
    code: 200,
  };
};
exports.login = login;
const loginSso = async (tokenSso) => {
  const userSso = await (0, sso_1.getUserInfo)(tokenSso);
  const user = await user_1.default.findOne({ email: userSso.email });
  if (!user) {
    return {
      data: null,
      message: "User not found",
      code: 404,
    };
  }
  const token = await (0, jwt_1.generateToken)(user);
  const result = {
    token: token,
  };
  return {
    data: result,
    message: "Successfully logged in",
    code: 200,
  };
};
exports.loginSso = loginSso;
