"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadReports =
  exports.storeReportByOutput =
  exports.storeReport =
  exports.printReports =
  exports.printReport =
  exports.deleteReportOutput =
  exports.deleteReport =
  exports.getReport =
  exports.getReports =
    void 0;
const utils_1 = require("../common/utils");
const configuration_1 = __importDefault(require("../schema/configuration"));
const contract_1 = __importDefault(require("../schema/contract"));
const output_1 = __importDefault(require("../schema/output"));
const partner_1 = __importDefault(require("../schema/partner"));
const report_1 = __importDefault(require("../schema/report"));
const handlebars_1 = __importDefault(require("handlebars"));
const fs_1 = __importDefault(require("fs"));
const puppeteer_html_pdf_1 = __importDefault(require("puppeteer-html-pdf"));
const getReports = async (period = "") => {
  let queries = {};
  if (period) queries["contract.period"] = period;
  const reports = await report_1.default.find(queries);
  const transformedReports = reports.map((item, index) => {
    return {
      ...item.toObject(),
      index: index + 1,
    };
  });
  return {
    data: transformedReports,
    message: "Successfully retrieved reports",
    code: 200,
  };
};
exports.getReports = getReports;
const getReport = async (id) => {
  const report = await report_1.default.findById(id);
  return {
    data: report,
    message: "Successfully retrieved report",
    code: 200,
  };
};
exports.getReport = getReport;
const deleteReport = async (id) => {
  await report_1.default.findByIdAndDelete(id);
  return {
    data: null,
    message: "Successfully deleted report",
    code: 204,
  };
};
exports.deleteReport = deleteReport;
const deleteReportOutput = async (id, outputId) => {
  const existingReport = await report_1.default.findById(id);
  if (!existingReport) {
    return {
      data: null,
      message: "Report not found",
      code: 404,
    };
  }
  const output = existingReport.outputs.find((item) => item.id == outputId);
  if (!output) {
    return {
      data: null,
      message: "Output not found",
      code: 404,
    };
  }
  const report = await report_1.default.findOneAndUpdate(
    {
      _id: id,
    },
    {
      $pull: {
        outputs: { _id: outputId },
      },
    },
    {
      new: true,
    }
  );
  return {
    data: report,
    message: "Successfully deleted report",
    code: 204,
  };
};
exports.deleteReportOutput = deleteReportOutput;
const printReport = async (id, claims) => {
  if (claims.team != "TU" && utils_1.isProduction) {
    return {
      data: null,
      message: "Only TU can print a report",
      code: 401,
    };
  }
  const report = await report_1.default.findById(id);
  if (!report) {
    return {
      data: null,
      message: "Report not found",
      code: 404,
    };
  }
  const result = await generateReportPdf(report);
  return {
    data: result,
    message: "Successfully print report",
    code: 200,
  };
};
exports.printReport = printReport;
const printReports = async (payload = [], claims) => {
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
      message: "Only TU can print a report",
      code: 401,
    };
  }
  const reports = await report_1.default.find({
    _id: { $in: payload },
  });
  let files = [];
  if (reports.length == 0) {
    return {
      data: null,
      message: "Reports by period not found",
      code: 404,
    };
  }
  const promises = reports.map(async (report) => {
    const result = await generateReportPdf(report);
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
    message: "Successfully print reports",
    code: 200,
  };
};
exports.printReports = printReports;
const storeReport = async (payload, claims) => {
  if (claims.position == "KEPALA") {
    return {
      data: null,
      message: "Head office can't create a report",
      code: 401,
    };
  }
  const existingReport = await report_1.default
    .findOne({
      "partner._id": payload.partner.partnerId,
      "contract.period": payload.contract.period,
    })
    .select(["_id"]);
  const availableSeq = await (0, utils_1.findAvailableSequence)(
    payload.contract.period,
    "report"
  );
  const number = (0, utils_1.generateReportNumber)(
    payload.contract.period,
    availableSeq
  );
  const authority = await configuration_1.default.findOne({
    name: "AUTHORITY",
  });
  if (!authority) {
    return {
      data: null,
      message: "Authority not found",
      code: 404,
    };
  }
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
  const contract = await contract_1.default
    .findOne({
      "partner._id": payload.partner.partnerId,
      period: payload.contract.period,
    })
    .select(["number", "period", "handOverDate"]);
  if (!contract) {
    return {
      data: null,
      message: "Contract not found",
      code: 404,
    };
  }
  const outputIds = payload.outputs.map((item) => item.outputId);
  const outputsDb = await output_1.default
    .find({
      _id: { $in: outputIds },
    })
    .select(["name", "unit"]);
  if (outputsDb.length == 0) {
    return {
      data: null,
      message: "Output not found",
      code: 404,
    };
  }
  const outputs = payload.outputs
    .map((itemPayload) => {
      const { outputId, ...restPayload } = itemPayload;
      const itemDb = outputsDb.find(
        (found) => found._id.toString() === outputId
      );
      return itemDb
        ? {
            ...itemDb.toObject(),
            ...restPayload,
          }
        : null;
    })
    .filter(utils_1.notEmpty);
  const data = {
    number: number,
    authority: authority.value,
    partner: partner,
    contract: contract,
    outputs: outputs,
  };
  let report;
  if (existingReport) {
    const outputIdsMatched = outputs.map((item) => item._id);
    const outputReport = await report_1.default.findOne({
      _id: existingReport.id,
      "outputs._id": { $in: outputIdsMatched },
    });
    if (outputReport) {
      const newOutputs = outputs.filter(
        (item) => !outputReport.outputs.some((itemDb) => itemDb.id == item._id)
      );
      const existOutputs = outputs.filter((item) =>
        outputReport.outputs.some((itemDb) => itemDb.id == item._id)
      );
      if (newOutputs.length > 0) {
        await report_1.default.findOneAndUpdate(
          {
            _id: existingReport.id,
          },
          {
            $push: { outputs: newOutputs },
          },
          {
            new: true,
          }
        );
      }
      if (existOutputs.length > 0) {
        const existingReportUpdated = await report_1.default.findById(
          existingReport.id
        );
        if (!existingReportUpdated) {
          return {
            data: null,
            message: "Something wrong",
            code: 400,
          };
        }
        const bulkOps = existOutputs.map((output) => {
          const outputDb = existingReportUpdated.outputs.find((item) => {
            return item.id == output._id.toString();
          });
          const update = {
            $set: {
              "outputs.$": output,
            },
          };
          return {
            updateMany: {
              filter: {
                _id: existingReport.id,
                "outputs._id": output._id,
              },
              update,
            },
          };
        });
        if (bulkOps.length > 0) {
          await report_1.default.bulkWrite(bulkOps);
        }
      }
      report = await report_1.default.findOne({
        "partner._id": payload.partner.partnerId,
        "contract.period": payload.contract.period,
      });
    } else {
      report = await report_1.default.findOneAndUpdate(
        {
          _id: existingReport.id,
        },
        {
          $push: { outputs: outputs },
        },
        {
          new: true,
        }
      );
    }
  } else {
    report = await report_1.default.create(data);
  }
  return {
    data: report,
    message: "Successfully created report",
    code: 201,
  };
};
exports.storeReport = storeReport;
const storeReportByOutput = async (payload, claims) => {
  if (claims.position == "KEPALA") {
    return {
      data: null,
      message: "Head office can't create contracts",
      code: 401,
    };
  }
  const lastSequence = await (0, utils_1.findLastSequence)(
    payload.contract.period,
    "report"
  );
  const partnerIds = payload.partners.map((item) => item.partnerId);
  const partners = await partner_1.default
    .find({
      _id: { $in: partnerIds },
    })
    .select(["name", "nik", "address"]);
  const contracts = await contract_1.default
    .find({
      "partner._id": { $in: partnerIds },
      period: payload.contract.period,
    })
    .select(["number", "period", "handOverDate", "partner"]);
  const existingReports = await report_1.default
    .find({
      "partner._id": { $in: partnerIds },
      "contract.period": payload.contract.period,
    })
    .select(["partner._id", "contract.period", "outputs"]);
  const authority = await configuration_1.default.findOne({
    name: "AUTHORITY",
  });
  if (!authority) {
    return {
      data: null,
      message: "Authority not found",
      code: 404,
    };
  }
  const ouputDb = await output_1.default
    .findById(payload.output.outputId)
    .select(["name", "unit"]);
  if (!ouputDb) {
    return {
      data: null,
      message: "Output not found",
      code: 404,
    };
  }
  const bulkOps = payload.partners
    .map((item, index) => {
      const number = (0, utils_1.generateReportNumber)(
        payload.contract.period,
        lastSequence + index
      );
      const partner = partners.find(
        (partner) => partner._id.toString() == item.partnerId
      );
      if (!partner) return null;
      const existingReport = existingReports.find(
        (report) =>
          report.partner._id == item.partnerId &&
          report.contract.period == payload.contract.period
      );
      const output = {
        ...ouputDb.toObject(),
        total: item.total,
      };
      let update;
      if (existingReport) {
        const existingOutput = existingReport.outputs.find(
          (item) => item.id == output._id
        );
        if (existingOutput) {
          update = {
            $set: {
              "outputs.$": output,
            },
          };
          return {
            updateMany: {
              filter: {
                "partner._id": item.partnerId,
                "contract.period": payload.contract.period,
                "outputs._id": existingOutput.id,
              },
              update,
            },
          };
        } else {
          update = {
            $push: { outputs: output },
          };
          return {
            updateOne: {
              filter: {
                "partner._id": item.partnerId,
                "contract.period": payload.contract.period,
              },
              update,
            },
          };
        }
      } else {
        const contract = contracts.find(
          (itemContract) => itemContract.partner.id == item.partnerId
        );
        if (!contract) return null;
        update = {
          number,
          authority: authority.value,
          partner,
          contract,
          outputs: [output],
        };
        return {
          updateOne: {
            filter: {
              "partner._id": item.partnerId,
              "contract.period": payload.contract.period,
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
      message: "Partners/Contracts not found",
      code: 404,
    };
  }
  await report_1.default.bulkWrite(bulkOps);
  const reports = await report_1.default.find({
    "partner._id": { $in: partnerIds },
    "contract.period": payload.contract.period,
  });
  return {
    data: reports,
    message: "Successfully created reports",
    code: 201,
  };
};
exports.storeReportByOutput = storeReportByOutput;
const generateReportPdf = async (report) => {
  const htmlPDF = new puppeteer_html_pdf_1.default();
  htmlPDF.setOptions({
    displayHeaderFooter: true,
    format: "A4",
    margin: {
      left: "95",
      right: "95",
      top: "50",
      bottom: "50",
    },
    headless: true,
    headerTemplate: `<p style="margin: auto;font-size: 13px;"></p>`,
    footerTemplate: `<p style="margin: auto;font-size: 13px;"><span class="pageNumber"></span></p>`,
  });
  const transformedOutputs = report.outputs.map((item, index) => ({
    number: index + 1,
    name: item.name,
    unit: item.unit,
    total: item.total,
  }));
  const html = fs_1.default.readFileSync("src/template/report.html", "utf8");
  const template = handlebars_1.default.compile(html);
  const payload = {
    number: report.number,
    contract: {
      number: report.contract.number,
    },
    period: {
      month: (0, utils_1.formatMonth)(report.contract.period),
      year: (0, utils_1.formatYear)(report.contract.period),
    },
    authority: {
      name: report.authority.name,
      nip: report.authority.nip,
      address: report.authority.address,
    },
    partner: {
      name: report.partner.name,
      nik: report.partner.nik,
      address: report.partner.address,
    },
    handOver: {
      dayText: (0, utils_1.formatDayText)(report.contract.handOverDate),
      dateText: (0, utils_1.formatDateText)(report.contract.handOverDate),
      monthText: (0, utils_1.formatMonthText)(report.contract.handOverDate),
      yearText: (0, utils_1.formatYearText)(report.contract.handOverDate),
    },
    outputs: transformedOutputs,
    region: utils_1.region,
  };
  const content = template(payload);
  const pdfBuffer = await htmlPDF.create(content);
  return {
    file: pdfBuffer,
    fileName: `${payload.number}_${payload.partner.name}`,
    period: `${payload.period.month} ${payload.period.year}`,
    name: report.partner.name,
  };
};
const downloadReports = async (ids = []) => {
  if (ids.length == 0) {
    return {
      data: null,
      message: "Please select reports",
      code: 400,
    };
  }
  const reports = await report_1.default.find({
    _id: { $in: ids },
  });
  const transformedReports = reports.flatMap((report) =>
    report.outputs.map((output) => ({
      partner: report.partner.name,
      number: report.number,
      contractNumber: report.contract.number,
      period: report.contract.period,
      ...output.toObject(),
    }))
  );
  const file = (0, utils_1.convertToCsv)(transformedReports);
  return {
    data: file,
    message: "Successfully downloaded reports",
    code: 200,
  };
};
exports.downloadReports = downloadReports;
