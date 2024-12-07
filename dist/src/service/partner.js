import { convertToCsv, isProduction } from "../common/utils.js";
import PartnerSchema from "../schema/partner.js";
import { parse } from "csv-parse/sync";
export const getPartners = async (year = "") => {
    let queries = {};
    if (year)
        queries.year = year;
    const partners = await PartnerSchema.find(queries);
    const transformedPartners = partners.map((partner, index) => {
        return {
            ...partner.toObject(),
            index: index + 1,
        };
    });
    return {
        data: transformedPartners,
        message: "Successfully retrieved partners",
        code: 200,
    };
};
export const getPartner = async (id) => {
    const partner = await PartnerSchema.findById(id);
    return {
        data: partner,
        message: "Successfully retrieved partner",
        code: 200,
    };
};
export const storePartner = async (payload, claims) => {
    if (!(claims.team == "IPDS" || claims.team == "TU") && isProduction) {
        return {
            data: null,
            message: "Only IPDS can create an partner",
            code: 401,
        };
    }
    const partner = await PartnerSchema.create(payload);
    return {
        data: partner,
        message: "Successfully created partner",
        code: 201,
    };
};
export const downloadPartner = async () => {
    const partners = await PartnerSchema.find().select([
        "name",
        "nik",
        "address",
    ]);
    const file = convertToCsv(partners);
    return {
        data: file,
        message: "Successfully downloaded partner",
        code: 200,
    };
};
export const uploadPartner = async (file, claims) => {
    if (!(claims.team == "IPDS" || claims.team == "TU") && isProduction) {
        return {
            data: null,
            message: "Only IPDS can update an partner",
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
    });
    const outputs = await PartnerSchema.create(data);
    return {
        data: outputs,
        message: "Successfully added partners",
        code: 201,
    };
};
export const updatePartner = async (id, payload, claims) => {
    if (!(claims.team == "IPDS" || claims.team == "TU") && isProduction) {
        return {
            data: null,
            message: "Only IPDS can update an partner",
            code: 401,
        };
    }
    const partner = await PartnerSchema.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return {
        data: partner,
        message: "Successfully updated partner",
        code: 200,
    };
};
export const deletePartners = async (ids = [], claims) => {
    if (!(claims.team == "IPDS" || claims.team == "TU") && isProduction) {
        return {
            data: null,
            message: "Only IPDS & TU can delete an partner",
            code: 401,
        };
    }
    if (ids.length == 0) {
        return {
            data: null,
            message: "Please select partners",
            code: 400,
        };
    }
    await PartnerSchema.deleteMany({
        _id: { $in: ids },
    });
    return {
        data: null,
        message: "Successfully deleted partners",
        code: 204,
    };
};
export const deletePartner = async (id, claims) => {
    if (!(claims.team == "IPDS" || claims.team == "TU") && isProduction) {
        return {
            data: null,
            message: "Only IPDS & TU can delete an partner",
            code: 401,
        };
    }
    await PartnerSchema.findByIdAndDelete(id);
    return {
        data: null,
        message: "Successfully deleted partner",
        code: 204,
    };
};
