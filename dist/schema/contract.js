"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractSchema = void 0;
const mongoose_1 = require("mongoose");
exports.contractSchema = new mongoose_1.Schema({
    number: { type: String, required: true, unique: true },
    period: { type: String, required: true },
    authority: {
        type: {
            name: { type: String, required: true },
            nip: { type: String, required: true },
            address: { type: String, required: true },
        },
    },
    partner: {
        type: {
            name: { type: String, required: true },
            nik: { type: String, required: true },
            address: { type: String, required: true },
        },
    },
    activities: [
        {
            type: {
                code: { type: String, required: true },
                name: { type: String, required: true },
                category: {
                    type: String,
                    required: true,
                    enum: ["ENUMERATION", "SUPERVISION", "PROCESSING"],
                },
                isSpecial: { type: Boolean, required: true, default: false },
                startDate: { type: Date, required: true },
                endDate: { type: Date, required: true },
                volume: { type: Number, required: true },
                unit: { type: String, required: true },
                rate: { type: Number, required: true },
                total: { type: Number, required: true },
                createdBy: {
                    type: String,
                    required: true,
                    enum: [
                        "SOSIAL",
                        "PRODUKSI",
                        "DISTRIBUSI",
                        "NERWILIS",
                        "IPDS",
                        "TU",
                    ],
                },
                status: {
                    type: String,
                    required: true,
                    enum: ["UNVERIFIED", "VERIFIED"],
                    default: "UNVERIFIED",
                },
            },
        },
    ],
    signDate: { type: Date, required: true },
    handOverDate: { type: Date, required: true },
    penalty: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
}, {
    timestamps: true,
});
const ContractSchema = (0, mongoose_1.model)("contracts", exports.contractSchema);
exports.default = ContractSchema;
