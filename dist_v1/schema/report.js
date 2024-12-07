import { Schema, model } from "mongoose";
export const reportSchema = new Schema({
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
const ReportSchema = model("reports", reportSchema);
export default ReportSchema;
