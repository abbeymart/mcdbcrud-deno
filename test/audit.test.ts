import { assertEquals, mcTest, postTestResult } from "../test_deps.ts";
import {
    AuditLogTypes, LogRecordsType, newAuditLog, newDbPg,
} from "../src/index.ts";
import { auditDb } from "./config/dbConfig.ts";

//
const tableName = "services";
const userId = "085f48c5-8763-4e22-a1c6-ac1a68ba07de";
const recs: LogRecordsType = {
    logRecords: {
        name    : "Abi",
        desc    : "Testing only",
        url     : "localhost:9000",
        priority: 1,
        cost    : 1000.00,
    },
};
const newRecs: LogRecordsType = {
    logRecords: {
        name    : "Abi Akindele",
        desc    : "Testing only - updated",
        url     : "localhost:9900",
        priority: 1,
        cost    : 2000.00,
    },
};
const readP: LogRecordsType = {
    logRecords: {keywords: ["lagos", "yoruba", "ghana", "accra"]},
};

const myDb = auditDb;
myDb.options = {};

const dbc = newDbPg(myDb, myDb.options);

(async () => {
    const dbClient = await dbc.pgPool().connect();
    // expected db-connection result
    const mcLogResult = {auditDb: dbClient, auditTable: "audits"};
    // audit-log instance
    const mcLog = newAuditLog(dbClient, "audits");
    await mcTest({
        name    : "should connect to the DB and return an instance object",
        testFunc: () => {
            assertEquals(
                mcLog.getAuditTable(),
                mcLogResult.auditTable,
                `audit-table should be: ${mcLogResult.auditTable}`,
            );
        },
    });

    await mcTest({
        name    : "should store create-transaction log and return success:",
        testFunc: async () => {
            const res = await mcLog.auditLog(AuditLogTypes.CREATE, {
                tableName : tableName,
                logRecords: recs,
            }, userId);
            assertEquals(res.code, "success", `res.Code should be: success`);
            assertEquals(
                res.message.includes("successfully"),
                true,
                `res-message should include: successfully`,
            );
        },
    });

    await mcTest({
        name    : "should store update-transaction log and return success:",
        testFunc: async () => {
            const res = await mcLog.auditLog(AuditLogTypes.UPDATE, {
                tableName    : tableName,
                logRecords   : recs,
                newLogRecords: newRecs,
            }, userId);
            assertEquals(res.code, "success", `res.Code should be: success`);
            assertEquals(
                res.message.includes("successfully"),
                true,
                `res-message should include: successfully`,
            );
        },
    });
    await mcTest({
        name    : "should store read-transaction log and return success:",
        testFunc: async () => {
            const res = await mcLog.auditLog(AuditLogTypes.READ, {
                tableName : tableName,
                logRecords: readP,
            }, userId);
            assertEquals(res.code, "success", `res.Code should be: success`);
            assertEquals(
                res.message.includes("successfully"),
                true,
                `res-message should include: successfully`,
            );
        },
    });
    await mcTest({
        name    : "should store delete-transaction log and return success:",
        testFunc: async () => {
            const res = await mcLog.auditLog(AuditLogTypes.DELETE, {
                tableName : tableName,
                logRecords: recs,
            }, userId);
            assertEquals(res.code, "success", `res.Code should be: success`);
            assertEquals(
                res.message.includes("successfully"),
                true,
                `res-message should include: successfully`,
            );
        },
    });
    await mcTest({
        name    : "should store login-transaction log and return success:",
        testFunc: async () => {
            const res = await mcLog.auditLog(AuditLogTypes.LOGIN, {
                tableName : tableName,
                logRecords: recs,
            }, userId);
            assertEquals(res.code, "success", `res.Code should be: success`);
            assertEquals(
                res.message.includes("successfully"),
                true,
                `res-message should include: successfully`,
            );
        },
    });

    await mcTest({
        name    : "should store logout-transaction log and return success:",
        testFunc: async () => {
            const res = await mcLog.auditLog(AuditLogTypes.LOGOUT, {
                tableName : tableName,
                logRecords: recs,
            }, userId);
            assertEquals(res.code, "success", `res.Code should be: success`);
            assertEquals(
                res.message.includes("successfully"),
                true,
                `res-message should include: successfully`,
            );
        },
    });

    await mcTest({
        name    : "should return paramsError for incomplete/undefined inputs:",
        testFunc: async () => {
            const res = await mcLog.auditLog(AuditLogTypes.CREATE, {
                tableName : "",
                logRecords: recs,
            }, userId);
            assertEquals(res.code, "paramsError", `res.Code should be: paramsError`);
            assertEquals(
                res.message.includes("Table or Collection name is required"),
                true,
                `res-message should include: Table or Collection name is required`,
            );
        },
    });

    postTestResult();
    await dbc.closePgPool();
})();
