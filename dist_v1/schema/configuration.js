import { Schema, model } from "mongoose";
export const configurationSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: ["AUTHORITY", "REGION", "RATE"],
    },
    value: {
        type: Schema.Types.Mixed,
        required: true,
    },
}, {
    timestamps: true,
});
const ConfigurationSchema = model("configurations", configurationSchema);
export default ConfigurationSchema;
