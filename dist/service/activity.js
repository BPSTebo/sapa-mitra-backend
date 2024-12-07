"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadActivities =
  exports.deleteActivity =
  exports.deleteActivities =
  exports.updateActivity =
  exports.storeActivity =
  exports.uploadActivity =
  exports.getActivity =
  exports.getActivities =
    void 0;
const utils_1 = require("../common/utils");
const activity_1 = __importDefault(require("../schema/activity"));
const sync_1 = require("csv-parse/sync");
const getActivities = async (year = "", claims) => {
  let queries = {};
  if (claims.team != "TU") queries.team = claims.team;
  if (year) queries.year = year;
  const activities = await activity_1.default.find(queries);
  const transformedActivities = activities.map((item, index) => {
    return {
      ...item.toObject(),
      index: index + 1,
    };
  });
  return {
    data: transformedActivities,
    message: "Successfully retrieved activities",
    code: 200,
  };
};
exports.getActivities = getActivities;
const getActivity = async (id) => {
  const activity = await activity_1.default.findById(id);
  return {
    data: activity,
    message: "Successfully retrieved activity",
    code: 200,
  };
};
exports.getActivity = getActivity;
const uploadActivity = async (file, claims) => {
  if (claims.team != "TU" && utils_1.isProduction) {
    return {
      data: null,
      message: "Only TU can create an activity",
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
  });
  const activities = await activity_1.default.create(data);
  return {
    data: activities,
    message: "Successfully created activities",
    code: 201,
  };
};
exports.uploadActivity = uploadActivity;
const storeActivity = async (payload, claims) => {
  if (claims.team != "TU" && utils_1.isProduction) {
    return {
      data: null,
      message: "Only TU can create an activity",
      code: 401,
    };
  }
  const activity = await activity_1.default.create(payload);
  return {
    data: activity,
    message: "Successfully created activity",
    code: 201,
  };
};
exports.storeActivity = storeActivity;
const updateActivity = async (id, payload, claims) => {
  if (claims.team != "TU" && utils_1.isProduction) {
    return {
      data: null,
      message: "Only TU can update an activity",
      code: 401,
    };
  }
  const activity = await activity_1.default.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return {
    data: activity,
    message: "Successfully updated activity",
    code: 200,
  };
};
exports.updateActivity = updateActivity;
const deleteActivities = async (ids = [], claims) => {
  if (claims.team != "TU" && utils_1.isProduction) {
    return {
      data: null,
      message: "Only IPDS & TU can delete an activities",
      code: 401,
    };
  }
  if (ids.length == 0) {
    return {
      data: null,
      message: "Please select activities",
      code: 400,
    };
  }
  await activity_1.default.deleteMany({
    _id: { $in: ids },
  });
  return {
    data: null,
    message: "Successfully deleted activities",
    code: 204,
  };
};
exports.deleteActivities = deleteActivities;
const deleteActivity = async (id, claims) => {
  if (claims.team != "TU" && utils_1.isProduction) {
    return {
      data: null,
      message: "Only TU can update an activity",
      code: 401,
    };
  }
  await activity_1.default.findByIdAndDelete(id);
  return {
    data: null,
    message: "Successfully deleted activity",
    code: 204,
  };
};
exports.deleteActivity = deleteActivity;
const downloadActivities = async (ids = []) => {
  if (ids.length == 0) {
    return {
      data: null,
      message: "Please select activities",
      code: 400,
    };
  }
  const activities = await activity_1.default.find({
    _id: { $in: ids },
  });
  const file = (0, utils_1.convertToCsv)(activities);
  return {
    data: file,
    message: "Successfully downloaded activities",
    code: 200,
  };
};
exports.downloadActivities = downloadActivities;
