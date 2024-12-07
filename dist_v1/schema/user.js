import { Schema, model } from "mongoose";
export const userSchema = new Schema({
    name: { type: String, required: true },
    nip: {
        type: String,
        required: true,
        unique: true,
        minlength: 18,
        maxlength: 18,
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    team: {
        type: String,
        required: false,
        enum: ["SOSIAL", "PRODUKSI", "DISTRIBUSI", "NERWILIS", "IPDS", "TU"],
    },
    position: {
        type: String,
        required: true,
        enum: ["ANGGOTA", "KETUA", "KEPALA"],
    },
}, {
    timestamps: true,
});
const UserSchema = model("users", userSchema);
export default UserSchema;
