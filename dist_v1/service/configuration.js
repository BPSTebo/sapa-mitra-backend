import { isValidStructure } from "./common/utils";
import ConfigurationSchema from "./schema/configuration";
export const getConfigurations = async () => {
    const configurations = await ConfigurationSchema.find();
    return {
        data: configurations,
        message: "Successfully retrieved configurations",
        code: 200,
    };
};
export const getConfiguration = async (name) => {
    const configuration = await ConfigurationSchema.findOne({ name: name });
    return {
        data: configuration,
        message: "Successfully retrieved configuration",
        code: 200,
    };
};
export const storeConfiguration = async (payload, claims) => {
    if (claims.team != "TU") {
        return {
            data: null,
            message: "Configuration can only be updated by the TU team",
            code: 400,
        };
    }
    let value;
    if (payload.name === "AUTHORITY") {
        value = isValidStructure(payload.value, ["name", "nip", "address"])
            ? {
                name: payload.value.name,
                nip: payload.value.nip,
                address: payload.value.address,
            }
            : null;
    }
    else if (payload.name === "REGION") {
        value = typeof payload.value === "string" ? payload.value : null;
    }
    else if (payload.name === "RATE") {
        value = isValidStructure(payload.value, [
            "enumeration",
            "supervision",
            "processing",
        ])
            ? {
                enumeration: payload.value.enumeration,
                supervision: payload.value.supervision,
                processing: payload.value.processing,
            }
            : null;
    }
    if (!value) {
        return {
            data: null,
            message: "Invalid payload",
            code: 400,
        };
    }
    const configuration = await ConfigurationSchema.create({
        name: payload.name,
        value: value,
    });
    return {
        data: configuration,
        message: "Successfully created configuration",
        code: 201,
    };
};
export const updateConfiguration = async (name, payload, claims) => {
    if (claims.team != "TU") {
        return {
            data: null,
            message: "Configuration can only be updated by the TU team",
            code: 400,
        };
    }
    let value;
    if (name === "AUTHORITY") {
        value = isValidStructure(payload.value, ["name", "nip", "address"])
            ? {
                name: payload.value.name,
                nip: payload.value.nip,
                address: payload.value.address,
            }
            : null;
    }
    else if (name === "REGION") {
        value = typeof payload.value === "string" ? payload.value : null;
    }
    else if (name === "RATE") {
        value = isValidStructure(payload.value, [
            "enumeration",
            "supervision",
            "processing",
        ])
            ? {
                enumeration: payload.value.enumeration,
                supervision: payload.value.supervision,
                processing: payload.value.processing,
            }
            : null;
    }
    if (!value) {
        return {
            data: null,
            message: "Invalid payload",
            code: 400,
        };
    }
    const configuration = await ConfigurationSchema.findOneAndUpdate({ name: name }, { value: value }, {
        new: true,
        runValidators: true,
        upsert: true,
    });
    return {
        data: configuration,
        message: "Successfully updated configuration",
        code: 200,
    };
};
export const deleteConfiguration = async (name, claims) => {
    if (claims.team != "TU") {
        return {
            data: null,
            message: "Configuration can only be updated by the TU team",
            code: 400,
        };
    }
    await ConfigurationSchema.findOneAndDelete({ name: name });
    return {
        data: null,
        message: "Successfully deleted configuration",
        code: 204,
    };
};
