import {
    assertEquals,
    mcTest,
    postTestResult,
} from "../test_deps.ts";
import { CrudParamsType, newDbPg, newDeleteRecord, } from "../src/index.ts";
import {
    AuditModel,
    CrudParamOptions,
    DeleteAllTable,
    DeleteAuditById,
    DeleteAuditByIds,
    DeleteAuditByParams,
    DeleteTable,
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
        table      : DeleteTable,
        userInfo   : TestUserInfo,
        recordIds  : [],
        queryParams: {},
    };

    await mcTest({
        name    :
            "should prevent the delete of all table records and return removeError:",
        testFunc: async () => {
            crudParams.table = DeleteAllTable;
            crudParams.recordIds = [];
            crudParams.queryParams = {};
            const crud = newDeleteRecord(crudParams, CrudParamOptions);
            const res = await crud.deleteRecord();
            console.log("delete-all-res: ", res);
            assertEquals(
                res.code,
                "removeError",
                `delete-task permitted by ids or queryParams only: removeError code expected`,
            );
        },
    });

    await mcTest({
        name    :
            "should delete record by Id and return success or notFound[delete-record-method]:",
        testFunc: async () => {
            crudParams.table = DeleteTable;
            crudParams.recordIds = [DeleteAuditById];
            crudParams.queryParams = {};
            const crud = newDeleteRecord(crudParams, CrudParamOptions);
            const res = await crud.deleteRecord();
            console.log("delete-by-id-res: ", res);
            const resCode = res.code == "success" || res.code == "notFound";
            assertEquals(resCode, true, `res-code should be success or notFound:`);
        },
    });

    await mcTest({
        name    :
            "should delete record by Ids and return success or notFound[delete-record-method]:",
        testFunc: async () => {
            crudParams.table = DeleteTable;
            crudParams.recordIds = DeleteAuditByIds;
            crudParams.queryParams = {};
            const crud = newDeleteRecord(crudParams, CrudParamOptions);
            const res = await crud.deleteRecord();
            console.log("delete-by-ids-res: ", res);
            const resCode = res.code == "success" || res.code == "notFound";
            assertEquals(resCode, true, `res-code should be success or notFound:`);
        },
    });

    await mcTest({
        name    :
            "should delete records by query-params and return success or notFound[delete-record-method]:",
        testFunc: async () => {
            crudParams.table = DeleteTable;
            crudParams.recordIds = [];
            crudParams.queryParams = DeleteAuditByParams;
            const crud = newDeleteRecord(crudParams, CrudParamOptions);
            const res = await crud.deleteRecord();
            console.log("delete-by-params-res: ", res);
            const resCode = res.code == "success" || res.code == "notFound";
            assertEquals(resCode, true, `res-code should be success or notFound:`);
        },
    });

    postTestResult();
    await dbc.closePgPool();
})();
