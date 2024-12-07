"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContractActivityVolume =
  exports.updateContract =
  exports.downloadContracts =
  exports.getContractStatistics =
  exports.cancelContractActivity =
  exports.verifyContractActivity =
  exports.printContracts =
  exports.printContract =
  exports.deleteContractActivity =
  exports.updateContractActivity =
  exports.getContractActivity =
  exports.deletContract =
  exports.storeContract =
  exports.storeContractByActivity =
  exports.getContract =
  exports.getContracts =
    void 0;
const utils_1 = require("../common/utils");
const activity_1 = __importDefault(require("../schema/activity"));
const configuration_1 = __importDefault(require("../schema/configuration"));
const contract_1 = __importDefault(require("../schema/contract"));
const partner_1 = __importDefault(require("../schema/partner"));
const handlebars_1 = __importDefault(require("handlebars"));
const fs_1 = __importDefault(require("fs"));
const puppeteer_html_pdf_1 = __importDefault(require("puppeteer-html-pdf"));
const terbilang_ts_1 = __importDefault(require("terbilang-ts"));
const output_1 = __importDefault(require("../schema/output"));
const getContracts = async (period = "", status = "", claims) => {
  let queries = {};
  if (period) queries.period = period;
  if (status) queries["activities.status"] = status;
  if (status == "VERIFIED" || status == "UNVERIFIED") {
    queries["activities.createdBy"] = claims.team;
  }
  const limits = await configuration_1.default.findOne({ name: "RATE" });
  if (!limits) {
    return {
      data: null,
      message: "Rate limits have not been configured",
      code: 400,
    };
  }
  const contracts = await contract_1.default.find(queries);
  const transformedContracts = contracts.map((item, index) => {
    const limit = (0, utils_1.checkRateLimits)(item, limits);
    const hasSpecial = item.activities.some((activity) => activity.isSpecial);
    return {
      ...item.toObject(),
      ...limit,
      index: index + 1,
      hasSpecial: hasSpecial,
    };
  });
  return {
    data: transformedContracts,
    message: "Successfully retrieved contracts",
    code: 200,
  };
};
exports.getContracts = getContracts;
const getContract = async (id) => {
  const limits = await configuration_1.default.findOne({ name: "RATE" });
  if (!limits) {
    return {
      data: null,
      message: "Rate limits have not been configured",
      code: 400,
    };
  }
  const contract = await contract_1.default.findById(id);
  if (!contract) {
    return {
      data: null,
      message: "Contract not found",
      code: 404,
    };
  }
  const limit = (0, utils_1.checkRateLimits)(contract, limits);
  const hasSpecial = contract.activities.some((activity) => activity.isSpecial);
  return {
    data: {
      ...contract.toObject(),
      ...limit,
      hasSpecial: hasSpecial,
    },
    message: "Successfully retrieved contract",
    code: 200,
  };
};
exports.getContract = getContract;
const storeContractByActivity = async (payload, claims) => {
  if (claims.position !== "ANGGOTA" && claims.team !== "TU") {
    return {
      data: null,
      message: "Only member can create contracts",
      code: 401,
    };
  }
  const lastSequence = await (0, utils_1.findLastSequence)(
    payload.contract.period,
    "contract"
  );
  const limits = await configuration_1.default.findOne({ name: "RATE" });
  if (!limits) {
    return {
      data: null,
      message: "Rate limits have not been configured",
      code: 400,
    };
  }
  const { activityId, ...restActivityPayload } = payload.activity;
  const partnerIds = payload.partners.map((item) => item.partnerId);
  const partners = await partner_1.default
    .find({
      _id: { $in: partnerIds },
    })
    .select(["name", "nik", "address"]);
  const existingContracts = await contract_1.default
    .find({
      "partner._id": { $in: partnerIds },
      period: payload.contract.period,
    })
    .select(["partner._id", "period", "grandTotal", "activities"]);
  const signDate = (0, utils_1.calculateSignDate)(payload.contract.period);
  const handOverDate = (0, utils_1.calculateHandOverDate)(
    payload.contract.period
  );
  const authority = await configuration_1.default.findOne({
    name: "AUTHORITY",
  });
  const activityDb = await activity_1.default
    .findById(activityId)
    .select(["code", "name", "unit", "category", "team", "isSpecial"]);
  if (!activityDb) {
    return {
      data: null,
      message: "Activity not found",
      code: 404,
    };
  }
  const bulkOps = payload.partners
    .map((item, index) => {
      const number = (0, utils_1.generateContractNumber)(
        payload.contract.period,
        lastSequence + index
      );
      const partner = partners.find(
        (partner) => partner._id.toString() == item.partnerId
      );
      if (!partner) return null;
      const existingContract = existingContracts.find(
        (contract) =>
          contract.partner._id == item.partnerId &&
          contract.period == payload.contract.period
      );
      const activity = {
        ...restActivityPayload,
        ...activityDb.toObject(),
        volume: item.volume,
        total: item.volume * payload.activity.rate,
        createdBy: activityDb.team,
      };
      let update;
      if (existingContract) {
        const existingActivity = existingContract.activities.find(
          (item) => item.id == activity._id
        );
        if (existingActivity) {
          update = {
            $set: {
              grandTotal:
                existingContract.grandTotal +
                activity.total -
                existingActivity.total,
              "activities.$": activity,
            },
          };
          return {
            updateMany: {
              filter: {
                "partner._id": item.partnerId,
                period: payload.contract.period,
                "activities._id": existingActivity.id,
              },
              update,
            },
          };
        } else {
          update = {
            $push: { activities: activity },
            $set: {
              grandTotal: existingContract.grandTotal + activity.total,
            },
          };
          return {
            updateOne: {
              filter: {
                "partner._id": item.partnerId,
                period: payload.contract.period,
              },
              update,
            },
          };
        }
      } else {
        update = {
          number,
          period: payload.contract.period,
          authority: authority?.value,
          partner,
          activities: [activity],
          signDate,
          handOverDate,
          penalty: 0,
          grandTotal: activity.total,
        };
        return {
          updateOne: {
            filter: {
              "partner._id": item.partnerId,
              period: payload.contract.period,
            },
            update,
            upsert: true,
          },
        };
      }
    })
    .filter(utils_1.notEmpty);
  if (bulkOps.length == 0) {
    return {
      data: null,
      message: "Partners not found",
      code: 404,
    };
  }
  await contract_1.default.bulkWrite(bulkOps);
  const contracts = await contract_1.default.find({
    "partner._id": { $in: partnerIds },
    period: payload.contract.period,
  });
  const transformedContracts = contracts.map((item, index) => {
    const limit = (0, utils_1.checkRateLimits)(item, limits);
    return {
      ...item.toObject(),
      ...limit,
    };
  });
  return {
    data: transformedContracts,
    message: "Successfully created contracts",
    code: 201,
  };
};
exports.storeContractByActivity = storeContractByActivity;
const storeContract = async (payload, claims) => {
  if (claims.position !== "ANGGOTA" && claims.team !== "TU") {
    return {
      data: null,
      message: "Only member can create contracts",
      code: 401,
    };
  }
  const limits = await configuration_1.default.findOne({ name: "RATE" });
  if (!limits) {
    return {
      data: null,
      message: "Rate limits have not been configured",
      code: 400,
    };
  }
  const existingContract = await contract_1.default
    .findOne({
      "partner._id": payload.partner.partnerId,
      period: payload.contract.period,
    })
    .select(["_id", "grandTotal"]);
  const availableSeq = await (0, utils_1.findAvailableSequence)(
    payload.contract.period,
    "contract"
  );
  const number = (0, utils_1.generateContractNumber)(
    payload.contract.period,
    availableSeq
  );
  const authority = await configuration_1.default.findOne({
    name: "AUTHORITY",
  });
  const partner = await partner_1.default
    .findById(payload.partner.partnerId)
    .select(["name", "nik", "address"]);
  if (!partner) {
    return {
      data: null,
      message: "Partner not found",
      code: 404,
    };
  }
  const activityIds = payload.activities.map((item) => item.activityId);
  const activitiesDb = await activity_1.default
    .find({
      _id: { $in: activityIds },
    })
    .select(["code", "name", "unit", "category", "team", "isSpecial"]);
  if (activitiesDb.length == 0) {
    return {
      data: null,
      message: "Activity not found",
      code: 404,
    };
  }
  const activities = payload.activities
    .map((itemPayload) => {
      const { activityId, ...restPayload } = itemPayload;
      const itemDb = activitiesDb.find(
        (found) => found._id.toString() === activityId
      );
      return itemDb
        ? {
            ...restPayload,
            ...itemDb.toObject(),
            total: restPayload.volume * restPayload.rate,
            createdBy: itemDb.team,
          }
        : null;
    })
    .filter(utils_1.notEmpty);
  const grandTotal = activities.reduce(
    (total, activity) => total + activity.total,
    0
  );
  const signDate = (0, utils_1.calculateSignDate)(payload.contract.period);
  const handOverDate = (0, utils_1.calculateHandOverDate)(
    payload.contract.period
  );
  const data = {
    number: number,
    period: payload.contract.period,
    authority: authority?.value,
    partner: partner,
    activities: activities,
    signDate: signDate,
    handOverDate: handOverDate,
    penalty: 0,
    grandTotal: grandTotal,
  };
  let contract;
  if (existingContract) {
    const activityIdsMatched = activities.map((item) => item._id);
    const activityContract = await contract_1.default.findOne({
      _id: existingContract.id,
      "activities._id": { $in: activityIdsMatched },
    });
    if (activityContract) {
      const newActivities = activities.filter(
        (item) =>
          !activityContract.activities.some((itemDb) => itemDb.id == item._id)
      );
      const existActivities = activities.filter((item) =>
        activityContract.activities.some((itemDb) => itemDb.id == item._id)
      );
      if (newActivities.length > 0) {
        const newGrandTotal = newActivities.reduce(
          (total, activity) => total + activity.total,
          0
        );
        await contract_1.default.findOneAndUpdate(
          {
            _id: existingContract.id,
          },
          {
            $set: {
              grandTotal: existingContract.grandTotal + newGrandTotal,
            },
            $push: { activities: newActivities },
          },
          {
            new: true,
          }
        );
      }
      if (existActivities.length > 0) {
        const existingContractUpdated = await contract_1.default.findById(
          existingContract.id
        );
        if (!existingContractUpdated) {
          return {
            data: null,
            message: "Something wrong",
            code: 400,
          };
        }
        const bulkOps = existActivities.map((activity) => {
          const activityDb = existingContractUpdated.activities.find((item) => {
            return item.id == activity._id.toString();
          });
          const grandTotal =
            activity.total - (activityDb ? activityDb.total : 0);
          const update = {
            $inc: {
              grandTotal: grandTotal,
            },
            $set: {
              "activities.$": activity,
            },
          };
          return {
            updateMany: {
              filter: {
                _id: existingContract.id,
                "activities._id": activity._id,
              },
              update,
            },
          };
        });
        if (bulkOps.length > 0) {
          await contract_1.default.bulkWrite(bulkOps);
        }
      }
      contract = await contract_1.default.findOne({
        "partner._id": payload.partner.partnerId,
        period: payload.contract.period,
      });
    } else {
      contract = await contract_1.default.findOneAndUpdate(
        {
          _id: existingContract.id,
        },
        {
          $set: {
            grandTotal: existingContract.grandTotal + grandTotal,
          },
          $push: { activities: activities },
        },
        {
          new: true,
        }
      );
    }
  } else {
    contract = await contract_1.default.create(data);
  }
  let limit;
  if (contract) {
    limit = (0, utils_1.checkRateLimits)(contract, limits);
  }
  return {
    data: {
      ...contract?.toObject(),
      ...limit,
    },
    message: "Successfully created contract",
    code: 201,
  };
};
exports.storeContract = storeContract;
const deletContract = async (id) => {
  await contract_1.default.findByIdAndDelete(id);
  return {
    data: null,
    message: "Successfully deleted contract",
    code: 204,
  };
};
exports.deletContract = deletContract;
const getContractActivity = async (id, activityId, claims) => {
  const existingContract = await contract_1.default.findById(id);
  if (!existingContract) {
    return {
      data: null,
      message: "Contract not found",
      code: 404,
    };
  }
  const activity = existingContract.activities.find(
    (item) => item.id == activityId
  );
  if (!activity) {
    return {
      data: null,
      message: "Activity not found",
      code: 404,
    };
  }
  return {
    data: activity,
    message: "Successfully retrived contract activity",
    code: 200,
  };
};
exports.getContractActivity = getContractActivity;
const updateContractActivity = async (id, activityId, payload, claims) => {
  const existingContract = await contract_1.default.findById(id);
  if (!existingContract) {
    return {
      data: null,
      message: "Contract not found",
      code: 404,
    };
  }
  const activity = existingContract.activities.find(
    (item) => item.id == activityId
  );
  if (!activity) {
    return {
      data: null,
      message: "Activity not found",
      code: 404,
    };
  }
  if (activity.createdBy != claims.team && claims.team != "TU") {
    return {
      data: null,
      message: `only ${activity.createdBy} team or TU lead can delete`,
      code: 401,
    };
  }
  const total = payload.rate * payload.volume;
  const grandTotal = total - activity.total;
  activity.startDate = payload.startDate;
  activity.endDate = payload.endDate;
  activity.volume = payload.volume;
  activity.rate = payload.rate;
  activity.total = total;
  const contract = await contract_1.default.findOneAndUpdate(
    {
      _id: existingContract.id,
      "activities._id": activity._id,
    },
    {
      $inc: {
        grandTotal: grandTotal,
      },
      $set: {
        "activities.$": activity,
      },
    },
    {
      upsert: true,
    }
  );
  return {
    data: contract,
    message: "Successfully updated contract activity",
    code: 200,
  };
};
exports.updateContractActivity = updateContractActivity;
const deleteContractActivity = async (id, activityId, claims) => {
  const existingContract = await contract_1.default.findById(id);
  if (!existingContract) {
    return {
      data: null,
      message: "Contract not found",
      code: 404,
    };
  }
  const activity = existingContract.activities.find(
    (item) => item.id == activityId
  );
  if (!activity) {
    return {
      data: null,
      message: "Activity not found",
      code: 404,
    };
  }
  if (activity.createdBy != claims.team && claims.team != "TU") {
    return {
      data: null,
      message: `only ${activity.createdBy} team or TU lead can delete`,
      code: 401,
    };
  }
  const grandTotal = existingContract.grandTotal - activity.total;
  const contract = await contract_1.default.findOneAndUpdate(
    {
      _id: id,
    },
    {
      $pull: {
        activities: { _id: activityId },
      },
      $set: {
        grandTotal: grandTotal,
      },
    },
    {
      new: true,
    }
  );
  return {
    data: contract,
    message: "Successfully deleted contract activity",
    code: 204,
  };
};
exports.deleteContractActivity = deleteContractActivity;
const printContract = async (id, claims) => {
  if (claims.team != "TU" && utils_1.isProduction) {
    return {
      data: null,
      message: "Only TU can print a contract",
      code: 401,
    };
  }
  const contract = await contract_1.default.findById(id);
  if (!contract) {
    return {
      data: null,
      message: "Contract not found",
      code: 404,
    };
  }
  const isCompleted = contract.activities.every(
    (item) => item.status === "VERIFIED"
  );
  if (!isCompleted) {
    return {
      data: null,
      message: "Activity contract has not been fully verified",
      code: 400,
    };
  }
  const result = await generateContractPdf(contract);
  return {
    data: result,
    message: "Successfully print contract",
    code: 200,
  };
};
exports.printContract = printContract;
const printContracts = async (payload = [], claims) => {
  if (!payload) {
    return {
      data: null,
      message: "Please select contracts",
      code: 400,
    };
  }
  if (claims.team != "TU" && utils_1.isProduction) {
    return {
      data: null,
      message: "Only TU can print a contract",
      code: 401,
    };
  }
  const contracts = await contract_1.default.find({
    _id: { $in: payload },
    activities: {
      $all: [{ $elemMatch: { status: "VERIFIED" } }],
    },
  });
  let files = [];
  if (contracts.length == 0) {
    return {
      data: null,
      message: "All contracts have not been verified by activities",
      code: 404,
    };
  }
  const promises = contracts.map(async (contract) => {
    const result = await generateContractPdf(contract);
    files.push(result.file);
  });
  await Promise.all(promises);
  if (files.length == 0) {
    return {
      data: null,
      message: "Failed to generate contracts pdf",
      code: 404,
    };
  }
  const mergedFile = await (0, utils_1.mergeBuffer)(files);
  return {
    data: mergedFile,
    message: "Successfully print contracts",
    code: 200,
  };
};
exports.printContracts = printContracts;
const verifyContractActivity = async (id, activityId, claims) => {
  const limits = await configuration_1.default.findOne({ name: "RATE" });
  if (!limits) {
    return {
      data: null,
      message: "Rate limits have not been configured",
      code: 400,
    };
  }
  const existingContract = await contract_1.default.findById(id);
  if (!existingContract) {
    return {
      data: null,
      message: "Contract not found",
      code: 404,
    };
  }
  const activity = existingContract.activities.find(
    (item) => item.id == activityId
  );
  if (!activity) {
    return {
      data: null,
      message: "Activity not found",
      code: 404,
    };
  }
  if (claims.position != "KETUA") {
    return {
      data: null,
      message: `only leader team or TU team can verify`,
      code: 401,
    };
  }
  if (activity.createdBy != claims.team && claims.team != "TU") {
    return {
      data: null,
      message: `only ${activity.createdBy} team or TU team can verify`,
      code: 401,
    };
  }
  const limit = (0, utils_1.checkRateLimits)(existingContract, limits);
  if (limit.isExceeded && !activity.isSpecial) {
    return {
      data: null,
      message: `failed to verify, rate exceeds limit`,
      code: 400,
    };
  }
  const hasSpecial = existingContract.activities.some(
    (activity) => activity.isSpecial
  );
  if (hasSpecial && existingContract.activities.length > 1) {
    return {
      data: null,
      message: `failed to verify, contracts with special status cannot be more than 1 activity`,
      code: 400,
    };
  }
  const contract = await contract_1.default.findOneAndUpdate(
    {
      _id: id,
      "activities._id": activityId,
    },
    {
      $set: {
        "activities.$.status": "VERIFIED",
      },
    },
    {
      new: true,
    }
  );
  return {
    data: contract,
    message: "Successfully verified contract activity",
    code: 200,
  };
};
exports.verifyContractActivity = verifyContractActivity;
const cancelContractActivity = async (id, activityId, claims) => {
  const existingContract = await contract_1.default.findById(id);
  if (!existingContract) {
    return {
      data: null,
      message: "Contract not found",
      code: 404,
    };
  }
  const activity = existingContract.activities.find(
    (item) => item.id == activityId
  );
  if (!activity) {
    return {
      data: null,
      message: "Activity not found",
      code: 404,
    };
  }
  if (claims.position != "KETUA") {
    return {
      data: null,
      message: `only leader team or TU team can unverify`,
      code: 401,
    };
  }
  if (activity.createdBy != claims.team && claims.team != "TU") {
    return {
      data: null,
      message: `only ${activity.createdBy} team or TU team can unverify`,
      code: 401,
    };
  }
  const contract = await contract_1.default.findOneAndUpdate(
    {
      _id: id,
      "activities._id": activityId,
    },
    {
      $set: {
        "activities.$.status": "UNVERIFIED",
      },
    },
    {
      new: true,
    }
  );
  return {
    data: contract,
    message: "Successfully unverified contract activity",
    code: 200,
  };
};
exports.cancelContractActivity = cancelContractActivity;
const getContractStatistics = async (
  year = new Date().getFullYear().toString()
) => {
  const contracts = await contract_1.default
    .find({
      period: {
        $regex: year,
      },
    })
    .select([
      "partner.name",
      "period",
      "activities.status",
      "activities._id",
      "activities.createdBy",
    ])
    .sort("period");
  const result = [];
  contracts.forEach(({ partner, period, activities }) => {
    let periodData = result.find((r) => r.period === period);
    if (!periodData) {
      periodData = {
        period,
        status: {
          Verified: 0,
          Unverified: 0,
        },
        partners: [],
        activities: [],
        teams: {
          SOSIAL: 0,
          PRODUKSI: 0,
          DISTRIBUSI: 0,
          NERWILIS: 0,
          IPDS: 0,
          TU: 0,
        },
      };
      result.push(periodData);
    }
    activities.forEach((item) => {
      if (item.status === "VERIFIED") periodData.status.Verified++;
      if (item.status === "UNVERIFIED") periodData.status.Unverified++;
      if (item.createdBy === "SOSIAL") periodData.teams.SOSIAL++;
      if (item.createdBy === "PRODUKSI") periodData.teams.PRODUKSI++;
      if (item.createdBy === "DISTRIBUSI") periodData.teams.DISTRIBUSI++;
      if (item.createdBy === "NERWILIS") periodData.teams.NERWILIS++;
      if (item.createdBy === "IPDS") periodData.teams.IPDS++;
      if (item.createdBy === "TU") periodData.teams.TU++;
      if (!periodData.activities.includes(item.id.toString())) {
        periodData.activities.push(item.id.toString());
      }
    });
    periodData.partners.push(partner.name);
  });
  return {
    data: result,
    message: "Successfully verified contract activity",
    code: 200,
  };
};
exports.getContractStatistics = getContractStatistics;
const generateContractPdf = async (contract) => {
  const htmlPDF = new puppeteer_html_pdf_1.default();
  htmlPDF.setOptions({
    displayHeaderFooter: true,
    format: "A4",
    margin: {
      left: "95",
      right: "95",
      top: "60",
      bottom: "60",
    },
    headless: true,
    headerTemplate: `<p style="margin: auto;font-size: 13px;"></p>`,
    footerTemplate: `<p style="margin: auto;font-size: 13px;"><span class="pageNumber"></span></p>`,
  });
  const transformedActivities = contract.activities.map((item) => {
    const codes = item.code.split(".");
    let modifiedCode = "";
    codes.forEach((code, index) => {
      let separator = ".";
      if (index === 4) {
        separator = ". ";
      }
      modifiedCode += code;
      if (index < codes.length - 1) {
        modifiedCode += separator;
      }
    });
    return {
      code: modifiedCode,
      name: item.name,
      volume: item.volume,
      unit: item.unit,
      category: item.category,
      date: `${(0, utils_1.formatDate)(item.startDate)} - ${(0,
      utils_1.formatDate)(item.endDate)}`,
      total: (0, utils_1.formatCurrency)(item.total),
      budget: 0,
    };
  });
  const finalDate = new Date(contract.handOverDate);
  finalDate.setDate(finalDate.getDate());
  const html = fs_1.default.readFileSync("src/template/contract.html", "utf8");
  const template = handlebars_1.default.compile(html);
  const payload = {
    number: contract.number,
    period: {
      month: (0, utils_1.formatMonth)(contract.period),
      year: (0, utils_1.formatYear)(contract.period),
    },
    authority: {
      name: contract.authority.name,
      address: contract.authority.address,
    },
    partner: {
      name: contract.partner.name,
      address: contract.partner.address,
    },
    sign: {
      dayText: (0, utils_1.formatDayText)(contract.signDate),
      dateText: (0, utils_1.formatDateText)(contract.signDate),
      monthText: (0, utils_1.formatMonthText)(contract.signDate),
      dateFull: (0, utils_1.formatDateFull)(contract.signDate),
      yearText: (0, utils_1.formatYearText)(contract.signDate),
    },
    final: {
      dateFull: (0, utils_1.formatDateFull)(finalDate),
    },
    activities: transformedActivities,
    handOver: {
      dateFull: (0, utils_1.formatDateFull)(contract.handOverDate),
    },
    grandTotal: {
      nominal: (0, utils_1.formatCurrency)(contract.grandTotal),
      spell: (0, terbilang_ts_1.default)(contract.grandTotal),
    },
    region: utils_1.region,
  };
  const content = template(payload);
  const pdfBuffer = await htmlPDF.create(content);
  return {
    file: pdfBuffer,
    fileName: `${payload.number}_${payload.partner.name}`,
    period: `${payload.period.month} ${payload.period.year}`,
    name: contract.partner.name,
  };
};
const downloadContracts = async (ids = []) => {
  if (ids.length == 0) {
    return {
      data: null,
      message: "Please select contracts",
      code: 400,
    };
  }
  const contracts = await contract_1.default.find({
    _id: { $in: ids },
  });
  const transformedContracts = contracts.flatMap((contract) =>
    contract.activities.map((activity) => ({
      partner: contract.partner.name,
      number: contract.number,
      period: contract.period,
      grandTotal: contract.grandTotal,
      ...activity.toObject(),
    }))
  );
  const file = (0, utils_1.convertToCsv)(transformedContracts);
  return {
    data: file,
    message: "Successfully downloaded contracts",
    code: 200,
  };
};
exports.downloadContracts = downloadContracts;
const updateContract = async (id, payload, claims) => {
  if (claims.team !== "TU" || claims.position !== "KETUA") {
    return {
      data: null,
      message: "only TU lead can edit",
      code: 401,
    };
  }
  const existingContract = await contract_1.default.findById(id);
  if (!existingContract) {
    return {
      data: null,
      message: "Contract not found",
      code: 404,
    };
  }
  const contract = await contract_1.default.findOneAndUpdate(
    {
      _id: existingContract.id,
    },
    {
      $set: {
        number: payload.number,
        grandTotal: payload.grandTotal,
      },
    },
    {
      upsert: true,
    }
  );
  return {
    data: contract,
    message: "Successfully updated a contract",
    code: 200,
  };
};
exports.updateContract = updateContract;
const getContractActivityVolume = async (period, outputId) => {
  let activityId;
  if (outputId) {
    const output = await output_1.default
      .findById(outputId)
      .select(["activity._id"]);
    if (output) {
      activityId = output.activity.id;
    }
  }
  const contracts = await contract_1.default
    .find({
      ...(period && { period: period }),
      ...(activityId && { "activities._id": activityId }),
    })
    .select(["partner._id", "period", "activities._id", "activities.volume"]);
  const partnerVolume = contracts.map(({ partner, activities }) => {
    const activity = activities.find((item) => item._id == activityId);
    return {
      partnerId: partner._id,
      volume: activity?.volume || 0,
    };
  });
  return {
    data: partnerVolume,
    message: "Successfully updated a contract",
    code: 200,
  };
};
exports.getContractActivityVolume = getContractActivityVolume;
