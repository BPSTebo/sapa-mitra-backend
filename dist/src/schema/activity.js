import { Schema, model } from "mongoose";
export const activitySchema = new Schema({
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
const ActivitySchema = model("activities", activitySchema);
export default ActivitySchema;
