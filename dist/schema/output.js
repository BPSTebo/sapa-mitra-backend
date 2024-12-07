"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.outputSchema = void 0;
const mongoose_1 = require("mongoose");
exports.outputSchema = new mongoose_1.Schema({
    activity: {
        type: {
            name: { type: String, required: true },
        },
    },
    name: { type: String, required: true },
    unit: { type: String, required: true },
    year: { type: Number, required: true },
}, {
    timestamps: true,
});
const OutputSchema = (0, mongoose_1.model)("outputs", exports.outputSchema);
exports.default = OutputSchema;
