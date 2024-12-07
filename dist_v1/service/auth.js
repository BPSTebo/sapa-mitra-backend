import UserSchema from "./schema/user";
import { generateToken } from "./service/jwt";
import { getUserInfo } from "./service/sso";
export const login = async (email, password) => {
    const user = await UserSchema.findOne({ email });
    if (!user) {
        return {
            data: null,
            message: "User not found",
            code: 404,
        };
    }
    const { password: hashedPassword, ...restUser } = user.toObject(); // Convert the document to a plain object
    const isMatch = await process.password.verify(password, hashedPassword);
    if (!isMatch) {
        return {
            data: null,
            message: "Invalid credential",
            code: 400,
        };
    }
    const token = await generateToken(user);
    const result = {
        token: token,
    };
    return {
        data: result,
        message: "Successfully logged in",
        code: 200,
    };
};
export const loginSso = async (tokenSso) => {
    const userSso = await getUserInfo(tokenSso);
    const user = await UserSchema.findOne({ email: userSso.email });
    if (!user) {
        return {
            data: null,
            message: "User not found",
            code: 404,
        };
    }
    const token = await generateToken(user);
    const result = {
        token: token,
    };
    return {
        data: result,
        message: "Successfully logged in",
        code: 200,
    };
};
