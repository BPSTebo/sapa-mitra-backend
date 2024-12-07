"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = void 0;
const mongoose_1 = require("mongoose");
exports.userSchema = new mongoose_1.Schema({
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
const UserSchema = (0, mongoose_1.model)("users", exports.userSchema);
exports.default = UserSchema;
