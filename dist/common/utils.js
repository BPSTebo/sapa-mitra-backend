"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateState =
  exports.formatCurrency =
  exports.convertToCsv =
  exports.checkRateLimits =
  exports.isValidStructure =
  exports.positionOrder =
  exports.downloadTemplate =
  exports.mergeBuffer =
  exports.formatDate =
  exports.formatDateFull =
  exports.formatYearText =
  exports.formatMonthText =
  exports.formatYear =
  exports.formatMonth =
  exports.formatDateText =
  exports.formatDayText =
  exports.toArrayBuffer =
  exports.GATE_SERVICE_ID =
  exports.GATE_URL =
  exports.CLIENT_URL =
  exports.APP_HOST =
  exports.regionCode =
  exports.region =
  exports.mode =
  exports.isProduction =
  exports.calculateHandOverDate =
  exports.calculateSignDate =
  exports.generateContractNumber =
  exports.generateReportNumber =
  exports.findAvailableSequence =
  exports.notEmpty =
    void 0;
exports.createYearMonth = createYearMonth;
exports.findLastSequence = findLastSequence;
const terbilang_ts_1 = __importDefault(require("terbilang-ts"));
const pdf_lib_1 = require("pdf-lib");
const fs_1 = require("fs");
const crypto_1 = require("crypto");
const contract_1 = __importDefault(require("../schema/contract"));
const report_1 = __importDefault(require("../schema/report"));
const notEmpty = (value) => {
  return value !== null && value !== undefined;
};
exports.notEmpty = notEmpty;
function createYearMonth(param1, param2) {
  let year;
  let month;
  if (param1 instanceof Date) {
    year = param1.getFullYear();
    month = param1.getMonth() + 1;
  } else if (typeof param1 === "number" && typeof param2 === "number") {
    year = param1;
    month = param2;
    if (month < 1 || month > 12) {
      throw new Error("Month must be between 1 and 12");
    }
  } else {
    throw new Error("Invalid arguments");
  }
  const yearStr = year.toString().padStart(4, "0");
  const monthStr = month.toString().padStart(2, "0");
  return `${yearStr}-${monthStr}`;
}
async function findLastSequence(period, model) {
  let existingDocument;
  if (model == "contract") {
    existingDocument = await contract_1.default
      .findOne({ period })
      .sort({ number: -1 })
      .exec();
  } else if (model == "report") {
    existingDocument = await report_1.default
      .findOne({
        "contract.period": period,
      })
      .sort({ number: -1 })
      .exec();
  }
  let sequenceNumber = 1;
  if (existingDocument && existingDocument.number) {
    const lastNumber = parseInt(existingDocument.number.split("-")[1]);
    sequenceNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;
  }
  return sequenceNumber;
}
const findAvailableSequence = async (period, model) => {
  let documents = [];
  if (model == "contract") {
    documents = await contract_1.default.find({ period }).sort("number").exec();
  } else if (model == "report") {
    documents = await report_1.default
      .find({
        "contract.period": period,
      })
      .sort("number")
      .exec();
  }
  let availableSeq = 1;
  for (let i = 0; i < documents.length; i++) {
    const seq = parseInt(documents[i].number.split("-")[1]);
    if (seq !== availableSeq) {
      break;
    }
    availableSeq++;
  }
  return availableSeq;
};
exports.findAvailableSequence = findAvailableSequence;
const generateFormattedNumber = (period, type, sequence) => {
  const [year, month] = period.split("-");
  const mitraNumber = exports.regionCode;
  const spkNumber = String(sequence).padStart(3, "0");
  return `${type}-${spkNumber}/MITRA-${mitraNumber}/${month}/${year}`;
};
const generateReportNumber = (period, sequence) => {
  return generateFormattedNumber(period, "BAST", sequence);
};
exports.generateReportNumber = generateReportNumber;
const generateContractNumber = (period, sequence) => {
  return generateFormattedNumber(period, "SPK", sequence);
};
exports.generateContractNumber = generateContractNumber;
const calculateSignDate = (yearMonth) => {
  const [year, month] = yearMonth.split("-").map(Number);
  const date = new Date(year, month - 1);
  const signDate = new Date(date);
  signDate.setDate(signDate.getDate());
  return signDate;
};
exports.calculateSignDate = calculateSignDate;
const calculateHandOverDate = (yearMonth) => {
  const [year, month] = yearMonth.split("-").map(Number);
  const date = new Date(year, month);
  const handOverDate = new Date(date);
  handOverDate.setDate(handOverDate.getDate() - 1);
  return handOverDate;
};
exports.calculateHandOverDate = calculateHandOverDate;
exports.isProduction = process.env.APP_ENV === "production";
exports.mode = process.env.APP_ENV || "development";
exports.region = process.env.APP_REGION || "Kota Bontang";
exports.regionCode = process.env.APP_REGION_CODE || "6474";
exports.APP_HOST = process.env.APP_HOST || "http://localhost:4000";
exports.CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
exports.GATE_URL = process.env.GATE_URL || "http://localhost";
exports.GATE_SERVICE_ID =
  process.env.GATE_SERVICE_ID || "00000000-0000-0000-0000-000000000000";
const toArrayBuffer = (buffer) => {
  const arrayBuffer = new ArrayBuffer(buffer.length);
  const view = new Uint8Array(arrayBuffer);
  for (let i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return arrayBuffer;
};
exports.toArrayBuffer = toArrayBuffer;
const formatDayText = (isoDate) => {
  const options = {
    weekday: "long",
  };
  return isoDate.toLocaleDateString("id-ID", options);
};
exports.formatDayText = formatDayText;
const formatDateText = (isoDate) => {
  const options = {
    day: "numeric",
  };
  return (0, terbilang_ts_1.default)(
    Number(isoDate.toLocaleDateString("id-ID", options))
  );
};
exports.formatDateText = formatDateText;
const formatMonth = (inputDate) => {
  const dateParts = inputDate.split("-");
  const year = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]) - 1;
  const monthName = new Date(year, month).toLocaleString("id-ID", {
    month: "long",
  });
  return monthName;
};
exports.formatMonth = formatMonth;
const formatYear = (inputDate) => {
  const dateParts = inputDate.split("-");
  return dateParts[0];
};
exports.formatYear = formatYear;
const formatMonthText = (isoDate) => {
  const options = {
    month: "long",
  };
  return isoDate.toLocaleDateString("id-ID", options);
};
exports.formatMonthText = formatMonthText;
const formatYearText = (isoDate) => {
  const options = {
    year: "numeric",
  };
  return (0, terbilang_ts_1.default)(
    Number(isoDate.toLocaleDateString("id-ID", options))
  );
};
exports.formatYearText = formatYearText;
const formatDateFull = (isoDate) => {
  const options = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  return isoDate.toLocaleDateString("id-ID", options);
};
exports.formatDateFull = formatDateFull;
const formatDate = (date) => {
  const day = date.getUTCDate();
  const month = date.toLocaleString("id-ID", { month: "long" });
  const year = date.getUTCFullYear();
  return `${day} ${month} ${year}`;
};
exports.formatDate = formatDate;
const mergeBuffer = async (buffers) => {
  const mergedPdf = await pdf_lib_1.PDFDocument.create();
  for (const buffer of buffers) {
    const pdfDoc = await pdf_lib_1.PDFDocument.load(buffer);
    const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    for (const page of pages) {
      mergedPdf.addPage(page);
    }
  }
  const mergedPdfBytes = await mergedPdf.save();
  const data = Buffer.from(mergedPdfBytes);
  return data;
};
exports.mergeBuffer = mergeBuffer;
const downloadTemplate = async (filePath) => {
  const fileBuffer = fs_1.promises.readFile(filePath);
  return fileBuffer;
};
exports.downloadTemplate = downloadTemplate;
exports.positionOrder = {
  KEPALA: 1,
  KETUA: 2,
  ANGGOTA: 3,
};
const isValidStructure = (obj, fields = []) => {
  if (!obj || !fields.length) {
    return false;
  }
  return fields.every(
    (field) => typeof obj[field] === "string" || obj[field] === undefined
  );
};
exports.isValidStructure = isValidStructure;
const checkRateLimits = (data, limits) => {
  const categoryLimits = data.activities.map((activity) => {
    let limit = 0;
    const category = activity.category.toLowerCase();
    if (category in limits.value) {
      limit = parseInt(limits.value[category]);
    }
    return limit;
  });
  const minLimit = Math.min(...categoryLimits);
  return {
    isExceeded: data.grandTotal > minLimit,
    limit: minLimit,
  };
};
exports.checkRateLimits = checkRateLimits;
const isDocument = (obj) => typeof obj.toObject === "function";
const convertToCsv = (objects) => {
  const headers = Object.keys(
    isDocument(objects[0]) ? objects[0].toObject() : objects[0]
  ).join(";");
  const rows = objects
    .map((obj) => {
      const data = isDocument(obj) ? obj.toObject() : obj;
      return Object.values(data).join(";");
    })
    .join("\n");
  const csvString = `${headers}\n${rows}`;
  return Buffer.from(csvString, "utf-8");
};
exports.convertToCsv = convertToCsv;
const formatCurrency = (number) => {
  if (!number) return "0,00";
  const parts = number.toFixed(2).toString().split(".");
  const formattedInteger = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formattedInteger},${parts[1]}`;
};
exports.formatCurrency = formatCurrency;
const generateState = () => {
  return (0, crypto_1.randomBytes)(16).toString("hex");
};
exports.generateState = generateState;
