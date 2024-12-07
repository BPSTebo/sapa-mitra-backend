import { isProduction } from "../common/utils.js";
import UserSchema from "../schema/user.js";
import { parse } from "csv-parse/sync";
import bcrypt from "bcrypt";
export const getUsers = async (claims) => {
    const users = await UserSchema.find().select(["-password"]);
    const transformedUsers = users.map((item, index) => {
        return {
            ...item.toObject(),
            index: index + 1,
        };
    });
    return {
        data: transformedUsers,
        message: "Successfully retrieved user",
        code: 200,
    };
};
export const getUser = async (id) => {
    const user = await UserSchema.findOne({ _id: id }).select(["-password"]);
    return {
        data: user,
        message: "Successfully retrieved user",
        code: 200,
    };
};
export const uploadUsers = async (file, claims) => {
    if (!(claims.team == "IPDS" || claims.team == "TU") && isProduction) {
        return {
            data: null,
            message: "Only IPDS can update an user",
            code: 401,
        };
    }
    if (!file) {
        return {
            data: null,
            message: "No file uploaded",
            code: 400,
        };
    }
    if (file.type != "text/csv") {
        return {
            data: null,
            message: "Only accepts csv file",
            code: 400,
        };
    }
    const fileContent = await file.text();
    const data = parse(fileContent, {
        columns: true,
        delimiter: ";",
        skip_empty_lines: true,
        cast: (value) => (value === "" ? null : value),
    });
    const outputs = await UserSchema.create(data);
    return {
        data: outputs,
        message: "Successfully uploaded users",
        code: 201,
    };
};
export const updatePassword = async (id, payload, claims) => {
    const user = await UserSchema.findById(id);
    if (!user) {
        return {
            data: null,
            message: "User not found",
            code: 404,
        };
    }
    if (claims.sub != id) {
        return {
            data: null,
            message: "Unauthorized access. You do not have permission to update this user's password.",
            code: 401,
        };
    }
    const { password: hashedPassword, ...restUser } = user.toObject(); // Convert the document to a plain object
    const isMatch = await bcrypt.compare(payload.oldPassword, hashedPassword);
    if (!isMatch) {
        return {
            data: null,
            message: "Invalid credential",
            code: 400,
        };
    }
    const hashedNewPassword = await bcrypt.hash(payload.newPassword, 10);
    const result = await UserSchema.findByIdAndUpdate(id, {
        password: hashedNewPassword,
    });
    if (!result) {
        return {
            data: null,
            message: "Failed to update password",
            code: 404,
        };
    }
    return {
        data: null,
        message: "Successfully changed password user",
        code: 200,
    };
};
