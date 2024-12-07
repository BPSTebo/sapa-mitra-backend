"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadOutputs =
  exports.deleteOutputs =
  exports.deleteOutput =
  exports.updateOutput =
  exports.uploadOutput =
  exports.storeOutput =
  exports.getOutput =
  exports.getOutputs =
    void 0;
const utils_1 = require("../common/utils");
const activity_1 = __importDefault(require("../schema/activity"));
const output_1 = __importDefault(require("../schema/output"));
const sync_1 = require("csv-parse/sync");
const getOutputs = async (year = "", claims) => {
  let queries = {};
  if (year) queries.year = year;
  const outputs = await output_1.default.find(queries);
  const filterOutputs = (
    await Promise.all(
      outputs.map(async (item, index) => {
        const activities = await activity_1.default.find({
          _id: item.activity.id,
          ...(claims.team !== "TU" ? { team: claims.team } : {}),
        });
        if (!activities.length) return null;
        return item.toObject();
      })
    )
  ).filter((output) => output !== null);
  const transformedOutputs = filterOutputs.map((item, index) => {
    return {
      ...item,
      index: index + 1,
    };
  });
  return {
    data: transformedOutputs,
    message: "Successfully retrieved outputs",
    code: 200,
  };
};
exports.getOutputs = getOutputs;
const getOutput = async (id) => {
  const output = await output_1.default.findById(id);
  return {
    data: output,
    message: "Successfully retrieved output",
    code: 200,
  };
};
exports.getOutput = getOutput;
const storeOutput = async (payload) => {
  const { activity: payloadActivity, ...restPayload } = payload;
  const activity = await activity_1.default
    .findById(payloadActivity.activityId)
    .select(["name"]);
  if (!activity) {
    return {
      data: null,
      message: "Activity not found",
      code: 404,
    };
  }
  const output = await output_1.default.create({
    activity: {
      ...activity,
    },
    ...restPayload,
  });
  return {
    data: output,
    message: "Successfully created output",
    code: 201,
  };
};
exports.storeOutput = storeOutput;
const uploadOutput = async (file) => {
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
  });
  const activityIds = data.map((item) => item.activityId);
  const activities = await activity_1.default
    .find({
      _id: { $in: activityIds },
    })
    .select(["name"]);
  const activityMap = new Map();
  activities.forEach((activity) => {
    activityMap.set(activity._id.toString(), activity);
  });
  const transformedData = data.map((item) => {
    const activity = activityMap.get(item.activityId);
    if (!activity) {
      return {
        data: null,
        message: `Activity with ID ${item.activityId} not found`,
        code: 400,
      };
    }
    return {
      activity: {
        ...activity,
      },
      name: item.name,
      unit: item.unit,
    };
  });
  const outputs = await output_1.default.create(transformedData);
  return {
    data: outputs,
    message: "Successfully created output",
    code: 201,
  };
};
exports.uploadOutput = uploadOutput;
const updateOutput = async (id, payload) => {
  const { activity: payloadActivity, ...restPayload } = payload;
  const activity = await activity_1.default
    .findById(payloadActivity.activityId)
    .select(["name"]);
  if (!activity) {
    return {
      data: null,
      message: "Activity not found",
      code: 404,
    };
  }
  const output = await output_1.default.findByIdAndUpdate(
    id,
    {
      activity: {
        ...activity,
      },
      ...restPayload,
    },
    {
      new: true,
    }
  );
  return {
    data: output,
    message: "Successfully updated output",
    code: 200,
  };
};
exports.updateOutput = updateOutput;
const deleteOutput = async (id) => {
  await output_1.default.findByIdAndDelete(id);
  return {
    data: null,
    message: "Successfully deleted output",
    code: 204,
  };
};
exports.deleteOutput = deleteOutput;
const deleteOutputs = async (ids = []) => {
  if (ids.length == 0) {
    return {
      data: null,
      message: "Please select outputs",
      code: 400,
    };
  }
  await output_1.default.deleteMany({
    _id: { $in: ids },
  });
  return {
    data: null,
    message: "Successfully deleted outputs",
    code: 204,
  };
};
exports.deleteOutputs = deleteOutputs;
const downloadOutputs = async (ids = []) => {
  if (ids.length == 0) {
    return {
      data: null,
      message: "Please select outputs",
      code: 400,
    };
  }
  const outputs = await output_1.default.find({
    _id: { $in: ids },
  });
  const transformedOutputs = outputs.map((item) => {
    const { activity, ...restItem } = item.toObject();
    return {
      ...restItem,
      activityName: activity.name,
    };
  });
  const file = (0, utils_1.convertToCsv)(transformedOutputs);
  return {
    data: file,
    message: "Successfully downloaded outputs",
    code: 200,
  };
};
exports.downloadOutputs = downloadOutputs;
