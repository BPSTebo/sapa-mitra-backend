import { Contract, YearMonth } from "@/model/contract";
import Terbilang from "terbilang-ts";
import { PDFDocument } from "pdf-lib";
import { promises as fs } from "fs";
import { randomBytes } from "crypto";
import { Configuration, Limits } from "@/model/configuration";
import ContractSchema from "@/schema/contract";
import ReportSchema from "@/schema/report";

export const notEmpty = <TValue>(
  value: TValue | null | undefined
): value is TValue => {
  return value !== null && value !== undefined;
};

export function createYearMonth(year: number, month: number): YearMonth;
export function createYearMonth(date: Date): YearMonth;

export function createYearMonth(
  param1: number | Date,
  param2?: number
): YearMonth {
  let year: number;
  let month: number;

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

  return `${yearStr}-${monthStr}` as YearMonth;
}

export async function findLastSequence(
  period: string,
  model: "contract" | "report"
): Promise<number> {
  let existingDocument;
  if (model == "contract") {
    existingDocument = await ContractSchema.findOne({ period })
      .sort({ number: -1 })
      .exec();
  } else if (model == "report") {
    existingDocument = await ReportSchema.findOne({
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

export const findAvailableSequence = async (
  period: string,
  model: "contract" | "report"
): Promise<number> => {
  let documents: any[] = [];
  if (model == "contract") {
    documents = await ContractSchema.find({ period }).sort("number").exec();
  } else if (model == "report") {
    documents = await ReportSchema.find({
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

const generateFormattedNumber = (
  period: string,
  type: string,
  sequence: number
): string => {
  const [year, month] = period.split("-");
  const mitraNumber = regionCode;

  const spkNumber = String(sequence).padStart(3, "0");
  return `${type}-${spkNumber}/MITRA-${mitraNumber}/${month}/${year}`;
};

export const generateReportNumber = (period: string, sequence: number) => {
  return generateFormattedNumber(period, "BAST", sequence);
};

export const generateContractNumber = (period: string, sequence: number) => {
  return generateFormattedNumber(period, "SPK", sequence);
};

export const calculateSignDate = (yearMonth: YearMonth) => {
  const [year, month] = yearMonth.split("-").map(Number);

  const date = new Date(year, month - 1);

  const signDate = new Date(date);
  signDate.setDate(signDate.getDate());

  return signDate;
};

export const calculateHandOverDate = (yearMonth: YearMonth) => {
  const [year, month] = yearMonth.split("-").map(Number);

  const date = new Date(year, month);

  const handOverDate = new Date(date);
  handOverDate.setDate(handOverDate.getDate() - 1);

  return handOverDate;
};

export const isProduction = process.env.APP_ENV === "production";

export const mode = process.env.APP_ENV || "development";

export const region = process.env.APP_REGION || "Kota Bontang";

export const regionCode = process.env.APP_REGION_CODE || "6474";

export const APP_HOST = process.env.APP_HOST || "http://localhost:4000";

export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

export const GATE_URL = process.env.GATE_URL || "http://localhost";

export const GATE_SERVICE_ID =
  process.env.GATE_SERVICE_ID || "00000000-0000-0000-0000-000000000000";

export const toArrayBuffer = (buffer: Buffer): ArrayBuffer => {
  const arrayBuffer = new ArrayBuffer(buffer.length);
  const view = new Uint8Array(arrayBuffer);
  for (let i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return arrayBuffer;
};

export const formatDayText = (isoDate: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
  };

  return isoDate.toLocaleDateString("id-ID", options);
};

export const formatDateText = (isoDate: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
  };

  return Terbilang(Number(isoDate.toLocaleDateString("id-ID", options)));
};

export const formatMonth = (inputDate: string): string => {
  const dateParts = inputDate.split("-");
  const year = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]) - 1;

  const monthName = new Date(year, month).toLocaleString("id-ID", {
    month: "long",
  });
  return monthName;
};

export const formatYear = (inputDate: string): string => {
  const dateParts = inputDate.split("-");

  return dateParts[0];
};

export const formatMonthText = (isoDate: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
  };

  return isoDate.toLocaleDateString("id-ID", options);
};

export const formatYearText = (isoDate: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
  };

  return Terbilang(Number(isoDate.toLocaleDateString("id-ID", options)));
};

export const formatDateFull = (isoDate: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  return isoDate.toLocaleDateString("id-ID", options);
};

export const formatDate = (date: Date): string => {
  const day = date.getUTCDate();
  const month = date.toLocaleString("id-ID", { month: "long" });
  const year = date.getUTCFullYear();

  return `${day} ${month} ${year}`;
};

export const mergeBuffer = async (buffers: Buffer[]): Promise<Buffer> => {
  const mergedPdf = await PDFDocument.create();
  for (const buffer of buffers) {
    const pdfDoc = await PDFDocument.load(buffer);
    const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());

    for (const page of pages) {
      mergedPdf.addPage(page);
    }
  }

  const mergedPdfBytes = await mergedPdf.save();

  const data = Buffer.from(mergedPdfBytes);

  return data;
};

export const downloadTemplate = async (filePath: string): Promise<Buffer> => {
  const fileBuffer = fs.readFile(filePath);

  return fileBuffer;
};

export const positionOrder: { [key: string]: number } = {
  KEPALA: 1,
  KETUA: 2,
  ANGGOTA: 3,
};

export const isValidStructure = (obj: any, fields: string[] = []): boolean => {
  if (!obj || !fields.length) {
    return false;
  }

  return fields.every(
    (field) => typeof obj[field] === "string" || obj[field] === undefined
  );
};

export const checkRateLimits = (
  data: Contract,
  limits: Configuration<Limits>
): any => {
  const categoryLimits = data.activities.map((activity) => {
    let limit = 0;
    const category = activity.category.toLowerCase() as keyof Limits;

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

const isDocument = (obj: any) => typeof obj.toObject === "function";

export const convertToCsv = (objects: any[]): Buffer => {
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

export const formatCurrency = (number: number): string => {
  if (!number) return "0,00";
  const parts = number.toFixed(2).toString().split(".");
  const formattedInteger = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${formattedInteger},${parts[1]}`;
};

export const generateState = () => {
  return randomBytes(16).toString("hex");
};
