import {
    assertEquals,
    assertNotEquals,
    mcTest,
    postTestResult,
} from "../test_deps.ts";
import { ValueType } from "../deps.ts"
import {
    CrudParamsType,
    GetResultType,
    newDbPg,
    newGetRecord,
} from "../src/index.ts";
import {
    AuditModel,
    CrudParamOptions,
    GetAuditById,
    GetAuditByIds,
    GetAuditByParams,
    GetTable,
    TestUserInfo,
} from "./testData.ts";
import { appDb, auditDb } from "./config/dbConfig.ts";

const myDb = appDb;
myDb.options = {};

const aDb = auditDb;
aDb.options = {};

const dbc = newDbPg(myDb, myDb.options);
const auditDbc = newDbPg(aDb, aDb.options);

(async () => {
    const dbPool = dbc.pgPool();
    const dbPoolClient = await dbPool.connect();

    const auditDbPool = auditDbc.pgPool();

    CrudParamOptions.auditDb = await auditDbPool.connect();

    const crudParams: CrudParamsType = {
        appDb      : dbPoolClient,
        modelRef   : AuditModel,
        table      : GetTable,
        userInfo   : TestUserInfo,
        recordIds  : [],
        queryParams: {},
    };

    await mcTest({
        name    : "should get records by Id and return success:",
        testFunc: async () => {
            crudParams.recordIds = [GetAuditById];
            crudParams.queryParams = {};
            const crud = newGetRecord(crudParams, CrudParamOptions);
            const res = await crud.getRecord();
            const resValue = res.value as unknown as GetResultType<ValueType>;
            const recLen = resValue.records?.length || 0;
            const recCount = resValue.stats?.recordsCount || 0;
            assertEquals(res.code, "success", `response-code should be: success`);
            assertNotEquals(
                res.code,
                "unAuthorized",
                `response-code should be: success not unAuthorized`,
            );
            assertEquals(recLen, 1, `response-value-records-length should be: 1`);
            assertEquals(
                recCount,
                1,
                `response-value-stats-recordsCount should be: 1`,
            );
        },
    });

    await mcTest({
        name    : "should get records by Ids and return success:",
        testFunc: async () => {
            crudParams.recordIds = GetAuditByIds;
            crudParams.queryParams = {};
            const crud = newGetRecord(crudParams, CrudParamOptions);
            const res = await crud.getRecord();
            const resValue = res.value as unknown as GetResultType<ValueType>;
            const recLen = resValue.records?.length || 0;
            const recCount = resValue.stats?.recordsCount || 0;
            assertEquals(res.code, "success", `response-code should be: success`);
            assertNotEquals(
                res.code,
                "unAuthorized",
                `response-code should be: success not unAuthorized`,
            );
            assertEquals(recLen, 2, `response-value-records-length should be: 2`);
            assertEquals(
                recCount,
                2,
                `response-value-stats-recordsCount should be: 2`,
            );
        },
    });

    //
    await mcTest({
        name    : "should get records by query-params and return success:",
        testFunc: async () => {
            crudParams.recordIds = [];
            crudParams.queryParams = GetAuditByParams;
            const crud = newGetRecord(crudParams, CrudParamOptions);
            const res = await crud.getRecord();
            const resValue = res.value as unknown as GetResultType<ValueType>;
            const recLen = resValue.records?.length || 0;
            const recCount = resValue.stats?.recordsCount || 0;
            assertEquals(res.code, "success", `response-code should be: success`);
            assertNotEquals(
                res.code,
                "unAuthorized",
                `response-code should be: success not unAuthorized`,
            );
            assertEquals(
                recLen > 0,
                true,
                `response-value-records-length should be: > 0`,
            );
            assertEquals(
                recCount > 0,
                true,
                `response-value-stats-recordsCount should be:  > 0`,
            );
        },
    });

    await mcTest({
        name    : "should get all records and return success:",
        testFunc: async () => {
            crudParams.table = GetTable;
            crudParams.recordIds = [];
            crudParams.queryParams = {};
            CrudParamOptions.getAllRecords = true;
            const crud = newGetRecord(crudParams, CrudParamOptions);
            const res = await crud.getRecord();
            const resValue = res.value as unknown as GetResultType<ValueType>;
            const recLen = resValue.records?.length || 0;
            const recCount = resValue.stats?.recordsCount || 0;
            assertEquals(res.code, "success", `response-code should be: success`);
            assertNotEquals(
                res.code,
                "unAuthorized",
                `response-code should be: success not unAuthorized`,
            );
            assertEquals(
                recLen > 20,
                true,
                `response-value-records-length should be: > 20`,
            );
            assertEquals(
                recCount > 20,
                true,
                `response-value-stats-recordsCount should be:  > 20`,
            );
        },
    });

    await mcTest({
        name    : "should get all records by limit/skip(offset) and return success:",
        testFunc: async () => {
            crudParams.table = GetTable;
            crudParams.recordIds = [];
            crudParams.queryParams = {};
            crudParams.skip = 0;
            crudParams.limit = 20;
            CrudParamOptions.getAllRecords = true;
            const crud = newGetRecord(crudParams, CrudParamOptions);
            const res = await crud.getRecord();
            const resValue = res.value as unknown as GetResultType<ValueType>;
            const recLen = resValue.records?.length || 0;
            const recCount = resValue.stats?.recordsCount || 0;
            assertEquals(res.code, "success", `response-code should be: success`);
            assertNotEquals(
                res.code,
                "unAuthorized",
                `response-code should be: success not unAuthorized`,
            );
            assertEquals(recLen, 20, `response-value-records-length should be: 20`);
            assertEquals(
                recCount,
                20,
                `response-value-stats-recordsCount should be: 20`,
            );
        },
    });

    postTestResult();
    await dbc.closePgPool();
})();
