"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurationSchema = void 0;
const mongoose_1 = require("mongoose");
exports.configurationSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: ["AUTHORITY", "REGION", "RATE"],
    },
    value: {
        type: mongoose_1.Schema.Types.Mixed,
        required: true,
    },
}, {
    timestamps: true,
});
const ConfigurationSchema = (0, mongoose_1.model)("configurations", exports.configurationSchema);
exports.default = ConfigurationSchema;
