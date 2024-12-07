"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteConfiguration =
  exports.updateConfiguration =
  exports.storeConfiguration =
  exports.getConfiguration =
  exports.getConfigurations =
    void 0;
const utils_1 = require("../common/utils");
const configuration_1 = __importDefault(require("../schema/configuration"));
const getConfigurations = async () => {
  const configurations = await configuration_1.default.find();
  return {
    data: configurations,
    message: "Successfully retrieved configurations",
    code: 200,
  };
};
exports.getConfigurations = getConfigurations;
const getConfiguration = async (name) => {
  const configuration = await configuration_1.default.findOne({ name: name });
  return {
    data: configuration,
    message: "Successfully retrieved configuration",
    code: 200,
  };
};
exports.getConfiguration = getConfiguration;
const storeConfiguration = async (payload, claims) => {
  if (claims.team != "TU") {
    return {
      data: null,
      message: "Configuration can only be updated by the TU team",
      code: 400,
    };
  }
  let value;
  if (payload.name === "AUTHORITY") {
    value = (0, utils_1.isValidStructure)(payload.value, [
      "name",
      "nip",
      "address",
    ])
      ? {
          name: payload.value.name,
          nip: payload.value.nip,
          address: payload.value.address,
        }
      : null;
  } else if (payload.name === "REGION") {
    value = typeof payload.value === "string" ? payload.value : null;
  } else if (payload.name === "RATE") {
    value = (0, utils_1.isValidStructure)(payload.value, [
      "enumeration",
      "supervision",
      "processing",
    ])
      ? {
          enumeration: payload.value.enumeration,
          supervision: payload.value.supervision,
          processing: payload.value.processing,
        }
      : null;
  }
  if (!value) {
    return {
      data: null,
      message: "Invalid payload",
      code: 400,
    };
  }
  const configuration = await configuration_1.default.create({
    name: payload.name,
    value: value,
  });
  return {
    data: configuration,
    message: "Successfully created configuration",
    code: 201,
  };
};
exports.storeConfiguration = storeConfiguration;
const updateConfiguration = async (name, payload, claims) => {
  if (claims.team != "TU") {
    return {
      data: null,
      message: "Configuration can only be updated by the TU team",
      code: 400,
    };
  }
  let value;
  if (name === "AUTHORITY") {
    value = (0, utils_1.isValidStructure)(payload.value, [
      "name",
      "nip",
      "address",
    ])
      ? {
          name: payload.value.name,
          nip: payload.value.nip,
          address: payload.value.address,
        }
      : null;
  } else if (name === "REGION") {
    value = typeof payload.value === "string" ? payload.value : null;
  } else if (name === "RATE") {
    value = (0, utils_1.isValidStructure)(payload.value, [
      "enumeration",
      "supervision",
      "processing",
    ])
      ? {
          enumeration: payload.value.enumeration,
          supervision: payload.value.supervision,
          processing: payload.value.processing,
        }
      : null;
  }
  if (!value) {
    return {
      data: null,
      message: "Invalid payload",
      code: 400,
    };
  }
  const configuration = await configuration_1.default.findOneAndUpdate(
    { name: name },
    { value: value },
    {
      new: true,
      runValidators: true,
      upsert: true,
    }
  );
  return {
    data: configuration,
    message: "Successfully updated configuration",
    code: 200,
  };
};
exports.updateConfiguration = updateConfiguration;
const deleteConfiguration = async (name, claims) => {
  if (claims.team != "TU") {
    return {
      data: null,
      message: "Configuration can only be updated by the TU team",
      code: 400,
    };
  }
  await configuration_1.default.findOneAndDelete({ name: name });
  return {
    data: null,
    message: "Successfully deleted configuration",
    code: 204,
  };
};
exports.deleteConfiguration = deleteConfiguration;
