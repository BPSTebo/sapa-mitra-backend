"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activitySchema = void 0;
const mongoose_1 = require("mongoose");
exports.activitySchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    unit: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ["ENUMERATION", "SUPERVISION", "PROCESSING"],
    },
    team: {
        type: String,
        required: true,
        enum: ["SOSIAL", "PRODUKSI", "DISTRIBUSI", "NERWILIS", "IPDS", "TU"],
    },
    isSpecial: { type: Boolean, required: true, default: false },
    year: { type: Number, required: true },
}, {
    timestamps: true,
});
const ActivitySchema = (0, mongoose_1.model)("activities", exports.activitySchema);
exports.default = ActivitySchema;
