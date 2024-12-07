"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportSchema = void 0;
const mongoose_1 = require("mongoose");
exports.reportSchema = new mongoose_1.Schema({
    number: { type: String, required: true, unique: true },
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
    contract: {
        type: {
            number: { type: String, required: true, unique: true },
            period: { type: String, required: true },
            handOverDate: { type: Date, required: true },
        },
    },
    outputs: [
        {
            type: {
                name: { type: String, required: true },
                unit: { type: String, required: true },
                total: { type: Number, required: true },
            },
        },
    ],
}, {
    timestamps: true,
});
const ReportSchema = (0, mongoose_1.model)("reports", exports.reportSchema);
exports.default = ReportSchema;
