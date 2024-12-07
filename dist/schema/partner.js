"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partnerSchema = void 0;
const mongoose_1 = require("mongoose");
exports.partnerSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    nik: {
        type: String,
        required: true,
        unique: true,
        minlength: 16,
        maxlength: 16,
    },
    address: { type: String, required: true },
    year: { type: Number, required: true },
}, {
    timestamps: true,
});
const PartnerSchema = (0, mongoose_1.model)("partners", exports.partnerSchema);
exports.default = PartnerSchema;
