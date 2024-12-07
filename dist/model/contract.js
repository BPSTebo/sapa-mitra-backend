"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractActivityPayload = void 0;
const byActivity = {
    partners: [
        {
            partnerId: "1",
            volume: 1,
        },
    ],
    contract: {
        period: "2020-02",
    },
    activity: {
        activityId: "xxxxx-xxxxx-xxx",
        startDate: new Date(),
        endDate: new Date(),
        rate: 1000,
    },
};
const byPartner = {
    partner: {
        partnerId: "zzzzzz-zzzzz-zzzzzzz",
    },
    contract: {
        period: "2020-02",
    },
    activities: [
        {
            activityId: "xxxxx-xxxxx-xxx",
            startDate: new Date(),
            endDate: new Date(),
            volume: 1,
            rate: 1000,
        },
    ],
};
exports.contractActivityPayload = {
    startDate: new Date(),
    endDate: new Date(),
    volume: 1,
    rate: 200,
};
