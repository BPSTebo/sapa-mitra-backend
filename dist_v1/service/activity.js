import { convertToCsv, isProduction } from "./common/utils";
import ActivitySchema from "./schema/activity";
import { parse } from "csv-parse/sync";
export const getActivities = async (year = "", claims) => {
    let queries = {};
    if (claims.team != "TU")
        queries.team = claims.team;
    if (year)
        queries.year = year;
    const activities = await ActivitySchema.find(queries);
    const transformedActivities = activities.map((item, index) => {
        return {
            ...item.toObject(),
            index: index + 1,
        };
    });
    return {
        data: transformedActivities,
        message: "Successfully retrieved activities",
        code: 200,
    };
};
export const getActivity = async (id) => {
    const activity = await ActivitySchema.findById(id);
    return {
        data: activity,
        message: "Successfully retrieved activity",
        code: 200,
    };
};
export const uploadActivity = async (file, claims) => {
    if (claims.team != "TU" && isProduction) {
        return {
            data: null,
            message: "Only TU can create an activity",
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
    const activities = await ActivitySchema.create(data);
    return {
        data: activities,
        message: "Successfully created activities",
        code: 201,
    };
};
export const storeActivity = async (payload, claims) => {
    if (claims.team != "TU" && isProduction) {
        return {
            data: null,
            message: "Only TU can create an activity",
            code: 401,
        };
    }
    const activity = await ActivitySchema.create(payload);
    return {
        data: activity,
        message: "Successfully created activity",
        code: 201,
    };
};
export const updateActivity = async (id, payload, claims) => {
    if (claims.team != "TU" && isProduction) {
        return {
            data: null,
            message: "Only TU can update an activity",
            code: 401,
        };
    }
    const activity = await ActivitySchema.findByIdAndUpdate(id, payload, {
        new: true,
    });
    return {
        data: activity,
        message: "Successfully updated activity",
        code: 200,
    };
};
export const deleteActivities = async (ids = [], claims) => {
    if (claims.team != "TU" && isProduction) {
        return {
            data: null,
            message: "Only IPDS & TU can delete an activities",
            code: 401,
        };
    }
    if (ids.length == 0) {
        return {
            data: null,
            message: "Please select activities",
            code: 400,
        };
    }
    await ActivitySchema.deleteMany({
        _id: { $in: ids },
    });
    return {
        data: null,
        message: "Successfully deleted activities",
        code: 204,
    };
};
export const deleteActivity = async (id, claims) => {
    if (claims.team != "TU" && isProduction) {
        return {
            data: null,
            message: "Only TU can update an activity",
            code: 401,
        };
    }
    await ActivitySchema.findByIdAndDelete(id);
    return {
        data: null,
        message: "Successfully deleted activity",
        code: 204,
    };
};
export const downloadActivities = async (ids = []) => {
    if (ids.length == 0) {
        return {
            data: null,
            message: "Please select activities",
            code: 400,
        };
    }
    const activities = await ActivitySchema.find({
        _id: { $in: ids },
    });
    const file = convertToCsv(activities);
    return {
        data: file,
        message: "Successfully downloaded activities",
        code: 200,
    };
};
