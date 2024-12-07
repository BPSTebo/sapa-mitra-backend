import { Schema, model } from "mongoose";
export const partnerSchema = new Schema({
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
const PartnerSchema = model("partners", partnerSchema);
export default PartnerSchema;
