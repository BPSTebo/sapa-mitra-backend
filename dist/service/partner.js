"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePartner =
  exports.deletePartners =
  exports.updatePartner =
  exports.uploadPartner =
  exports.downloadPartner =
  exports.storePartner =
  exports.getPartner =
  exports.getPartners =
    void 0;
const utils_1 = require("../common/utils");
const partner_1 = __importDefault(require("../schema/partner"));
const sync_1 = require("csv-parse/sync");
const getPartners = async (year = "") => {
  let queries = {};
  if (year) queries.year = year;
  const partners = await partner_1.default.find(queries);
  const transformedPartners = partners.map((partner, index) => {
    return {
      ...partner.toObject(),
      index: index + 1,
    };
  });
  return {
    data: transformedPartners,
    message: "Successfully retrieved partners",
    code: 200,
  };
};
exports.getPartners = getPartners;
const getPartner = async (id) => {
  const partner = await partner_1.default.findById(id);
  return {
    data: partner,
    message: "Successfully retrieved partner",
    code: 200,
  };
};
exports.getPartner = getPartner;
const storePartner = async (payload, claims) => {
  if (!(claims.team == "IPDS" || claims.team == "TU") && utils_1.isProduction) {
    return {
      data: null,
      message: "Only IPDS can create an partner",
      code: 401,
    };
  }
  const partner = await partner_1.default.create(payload);
  return {
    data: partner,
    message: "Successfully created partner",
    code: 201,
  };
};
exports.storePartner = storePartner;
const downloadPartner = async () => {
  const partners = await partner_1.default
    .find()
    .select(["name", "nik", "address"]);
  const file = (0, utils_1.convertToCsv)(partners);
  return {
    data: file,
    message: "Successfully downloaded partner",
    code: 200,
  };
};
exports.downloadPartner = downloadPartner;
const uploadPartner = async (file, claims) => {
  if (!(claims.team == "IPDS" || claims.team == "TU") && utils_1.isProduction) {
    return {
      data: null,
      message: "Only IPDS can update an partner",
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
  const outputs = await partner_1.default.create(data);
  return {
    data: outputs,
    message: "Successfully added partners",
    code: 201,
  };
};
exports.uploadPartner = uploadPartner;
const updatePartner = async (id, payload, claims) => {
  if (!(claims.team == "IPDS" || claims.team == "TU") && utils_1.isProduction) {
    return {
      data: null,
      message: "Only IPDS can update an partner",
      code: 401,
    };
  }
  const partner = await partner_1.default.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return {
    data: partner,
    message: "Successfully updated partner",
    code: 200,
  };
};
exports.updatePartner = updatePartner;
const deletePartners = async (ids = [], claims) => {
  if (!(claims.team == "IPDS" || claims.team == "TU") && utils_1.isProduction) {
    return {
      data: null,
      message: "Only IPDS & TU can delete an partner",
      code: 401,
    };
  }
  if (ids.length == 0) {
    return {
      data: null,
      message: "Please select partners",
      code: 400,
    };
  }
  await partner_1.default.deleteMany({
    _id: { $in: ids },
  });
  return {
    data: null,
    message: "Successfully deleted partners",
    code: 204,
  };
};
exports.deletePartners = deletePartners;
const deletePartner = async (id, claims) => {
  if (!(claims.team == "IPDS" || claims.team == "TU") && utils_1.isProduction) {
    return {
      data: null,
      message: "Only IPDS & TU can delete an partner",
      code: 401,
    };
  }
  await partner_1.default.findByIdAndDelete(id);
  return {
    data: null,
    message: "Successfully deleted partner",
    code: 204,
  };
};
exports.deletePartner = deletePartner;
