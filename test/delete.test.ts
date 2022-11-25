import {
  assertEquals,
  mcTest,
  ObjectType,
  postTestResult,
} from "../test_deps.ts";
import { CrudParamsType, DbConfigType, newDbPg, newDeleteRecord } from "../src/index.ts";
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
import { decryptEncodedFile } from "./config/config.ts";

let configOptions: ObjectType = {};
try {
  configOptions = decryptEncodedFile();
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
    table: DeleteTable,
    userInfo: TestUserInfo,
    recordIds: [],
    queryParams: {},
  };

  await mcTest({
    name:
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
    name:
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
    name:
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
    name:
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

  await postTestResult();
  await dbc.closePgPool();
})();
