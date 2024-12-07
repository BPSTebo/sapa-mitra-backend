"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePassword =
  exports.uploadUsers =
  exports.getUser =
  exports.getUsers =
    void 0;
const utils_1 = require("../common/utils");
const user_1 = __importDefault(require("../schema/user"));
const sync_1 = require("csv-parse/sync");
const bcrypt_1 = __importDefault(require("bcrypt"));
const getUsers = async (claims) => {
  const users = await user_1.default.find().select(["-password"]);
  const transformedUsers = users.map((item, index) => {
    return {
      ...item.toObject(),
      index: index + 1,
    };
  });
  return {
    data: transformedUsers,
    message: "Successfully retrieved user",
    code: 200,
  };
};
exports.getUsers = getUsers;
const getUser = async (id) => {
  const user = await user_1.default.findOne({ _id: id }).select(["-password"]);
  return {
    data: user,
    message: "Successfully retrieved user",
    code: 200,
  };
};
exports.getUser = getUser;
const uploadUsers = async (file, claims) => {
  if (!(claims.team == "IPDS" || claims.team == "TU") && utils_1.isProduction) {
    return {
      data: null,
      message: "Only IPDS can update an user",
      code: 401,
    };
  }
  if (!file) {
    return {
      data: null,
      message: "No file uploaded",
      code: 400,
    };
  }
  if (file.type != "text/csv") {
    return {
      data: null,
      message: "Only accepts csv file",
      code: 400,
    };
  }
  const fileContent = await file.text();
  const data = (0, sync_1.parse)(fileContent, {
    columns: true,
    delimiter: ";",
    skip_empty_lines: true,
    cast: (value) => (value === "" ? null : value),
  });
  const outputs = await user_1.default.create(data);
  return {
    data: outputs,
    message: "Successfully uploaded users",
    code: 201,
  };
};
exports.uploadUsers = uploadUsers;
const updatePassword = async (id, payload, claims) => {
  const user = await user_1.default.findById(id);
  if (!user) {
    return {
      data: null,
      message: "User not found",
      code: 404,
    };
  }
  if (claims.sub != id) {
    return {
      data: null,
      message:
        "Unauthorized access. You do not have permission to update this user's password.",
      code: 401,
    };
  }
  const { password: hashedPassword, ...restUser } = user.toObject(); // Convert the document to a plain object
  const isMatch = await bcrypt_1.default.compare(
    payload.oldPassword,
    hashedPassword
  );
  if (!isMatch) {
    return {
      data: null,
      message: "Invalid credential",
      code: 400,
    };
  }
  const hashedNewPassword = await bcrypt_1.default.hash(
    payload.newPassword,
    10
  );
  const result = await user_1.default.findByIdAndUpdate(id, {
    password: hashedNewPassword,
  });
  if (!result) {
    return {
      data: null,
      message: "Failed to update password",
      code: 404,
    };
  }
  return {
    data: null,
    message: "Successfully changed password user",
    code: 200,
  };
};
exports.updatePassword = updatePassword;
