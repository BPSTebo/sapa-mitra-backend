import { Schema, model } from "mongoose";
export const outputSchema = new Schema({
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
const OutputSchema = model("outputs", outputSchema);
export default OutputSchema;
