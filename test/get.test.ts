import {
  assertEquals,
  assertNotEquals,
  mcTest,
  ObjectType,
  postTestResult,
} from "../test_deps.ts";
import {
  CrudParamsType, DbConfigType,
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
import { decryptEncodedFile } from "./config/config.ts";

let configOptions: ObjectType = {};
try {
  configOptions = decryptEncodedFile();
  console.log("config-options: ", configOptions);
} catch (e) {
  console.error("\nConfiguration error: ", e);
  Deno.exit(1);
}
const myDb = configOptions.appDb as DbConfigType;
myDb.options = {};

const aDb = configOptions.auditDb as DbConfigType;
aDb.options = {};

const dbc = newDbPg(myDb, myDb.options);
const auditDbc = newDbPg(aDb, aDb.options);

(async () => {
  const dbPool = await dbc.pgPool();
  const dbPoolClient = await dbPool.connect();

  const auditDbPool = await auditDbc.pgPool();

  CrudParamOptions.auditDb = await auditDbPool.connect();

  const crudParams: CrudParamsType = {
    appDb: dbPoolClient,
    modelRef: AuditModel as unknown as ObjectType,
    table: GetTable,
    userInfo: TestUserInfo,
    recordIds: [],
    queryParams: {},
  };

  await mcTest({
    name: "should get records by Id and return success:",
    testFunc: async () => {
      crudParams.recordIds = [GetAuditById];
      crudParams.queryParams = {};
      const crud = newGetRecord(crudParams, CrudParamOptions);
      const res = await crud.getRecord();
      const resValue = res.value as unknown as GetResultType;
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
    name: "should get records by Ids and return success:",
    testFunc: async () => {
      crudParams.recordIds = GetAuditByIds;
      crudParams.queryParams = {};
      const crud = newGetRecord(crudParams, CrudParamOptions);
      const res = await crud.getRecord();
      const resValue = res.value as unknown as GetResultType;
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
    name: "should get records by query-params and return success:",
    testFunc: async () => {
      crudParams.recordIds = [];
      crudParams.queryParams = GetAuditByParams;
      const crud = newGetRecord(crudParams, CrudParamOptions);
      const res = await crud.getRecord();
      const resValue = res.value as unknown as GetResultType;
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
    name: "should get all records and return success:",
    testFunc: async () => {
      crudParams.table = GetTable;
      crudParams.recordIds = [];
      crudParams.queryParams = {};
      CrudParamOptions.getAllRecords = true;
      const crud = newGetRecord(crudParams, CrudParamOptions);
      const res = await crud.getRecord();
      const resValue = res.value as unknown as GetResultType;
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
    name: "should get all records by limit/skip(offset) and return success:",
    testFunc: async () => {
      crudParams.table = GetTable;
      crudParams.recordIds = [];
      crudParams.queryParams = {};
      crudParams.skip = 0;
      crudParams.limit = 20;
      CrudParamOptions.getAllRecords = true;
      const crud = newGetRecord(crudParams, CrudParamOptions);
      const res = await crud.getRecord();
      const resValue = res.value as unknown as GetResultType;
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

  await postTestResult();
  await dbc.closePgPool();
})();
