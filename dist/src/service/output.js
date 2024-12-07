import { convertToCsv } from "../common/utils.js";
import ActivitySchema from "../schema/activity.js";
import OutputSchema from "../schema/output.js";
import { parse } from "csv-parse/sync";
export const getOutputs = async (year = "", claims) => {
    let queries = {};
    if (year)
        queries.year = year;
    const outputs = await OutputSchema.find(queries);
    const filterOutputs = (await Promise.all(outputs.map(async (item, index) => {
        const activities = await ActivitySchema.find({
            _id: item.activity.id,
            ...(claims.team !== "TU" ? { team: claims.team } : {}),
        });
        if (!activities.length)
            return null;
        return item.toObject();
    }))).filter((output) => output !== null);
    const transformedOutputs = filterOutputs.map((item, index) => {
        return {
            ...item,
            index: index + 1,
        };
    });
    return {
        data: transformedOutputs,
        message: "Successfully retrieved outputs",
        code: 200,
    };
};
export const getOutput = async (id) => {
    const output = await OutputSchema.findById(id);
    return {
        data: output,
        message: "Successfully retrieved output",
        code: 200,
    };
};
export const storeOutput = async (payload) => {
    const { activity: payloadActivity, ...restPayload } = payload;
    const activity = await ActivitySchema.findById(payloadActivity.activityId).select(["name"]);
    if (!activity) {
        return {
            data: null,
            message: "Activity not found",
            code: 404,
        };
    }
    const output = await OutputSchema.create({
        activity: {
            ...activity,
        },
        ...restPayload,
    });
    return {
        data: output,
        message: "Successfully created output",
        code: 201,
    };
};
export const uploadOutput = async (file) => {
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
    const activityIds = data.map((item) => item.activityId);
    const activities = await ActivitySchema.find({
        _id: { $in: activityIds },
    }).select(["name"]);
    const activityMap = new Map();
    activities.forEach((activity) => {
        activityMap.set(activity._id.toString(), activity);
    });
    const transformedData = data.map((item) => {
        const activity = activityMap.get(item.activityId);
        if (!activity) {
            return {
                data: null,
                message: `Activity with ID ${item.activityId} not found`,
                code: 400,
            };
        }
        return {
            activity: {
                ...activity,
            },
            name: item.name,
            unit: item.unit,
        };
    });
    const outputs = await OutputSchema.create(transformedData);
    return {
        data: outputs,
        message: "Successfully created output",
        code: 201,
    };
};
export const updateOutput = async (id, payload) => {
    const { activity: payloadActivity, ...restPayload } = payload;
    const activity = await ActivitySchema.findById(payloadActivity.activityId).select(["name"]);
    if (!activity) {
        return {
            data: null,
            message: "Activity not found",
            code: 404,
        };
    }
    const output = await OutputSchema.findByIdAndUpdate(id, {
        activity: {
            ...activity,
        },
        ...restPayload,
    }, {
        new: true,
    });
    return {
        data: output,
        message: "Successfully updated output",
        code: 200,
    };
};
export const deleteOutput = async (id) => {
    await OutputSchema.findByIdAndDelete(id);
    return {
        data: null,
        message: "Successfully deleted output",
        code: 204,
    };
};
export const deleteOutputs = async (ids = []) => {
    if (ids.length == 0) {
        return {
            data: null,
            message: "Please select outputs",
            code: 400,
        };
    }
    await OutputSchema.deleteMany({
        _id: { $in: ids },
    });
    return {
        data: null,
        message: "Successfully deleted outputs",
        code: 204,
    };
};
export const downloadOutputs = async (ids = []) => {
    if (ids.length == 0) {
        return {
            data: null,
            message: "Please select outputs",
            code: 400,
        };
    }
    const outputs = await OutputSchema.find({
        _id: { $in: ids },
    });
    const transformedOutputs = outputs.map((item) => {
        const { activity, ...restItem } = item.toObject();
        return {
            ...restItem,
            activityName: activity.name,
        };
    });
    const file = convertToCsv(transformedOutputs);
    return {
        data: file,
        message: "Successfully downloaded outputs",
        code: 200,
    };
};
