/**
 * @Author: abbeymart | Abi Akindele | @Created: 2020-04-05 | @Updated: 2020-05-16
 * Updated 2018-04-08, prototype-to-class
 * @Company: mConnect.biz | @License: MIT
 * @Description: delete one or more records / documents by recordIds or queryParams
 */

// Import required module/function(s)
import {
  deleteHashCache,
  getResMessage,
  QueryHashCacheParamsType,
  QueryObjectResult,
  ResponseMessage,
} from "../../deps.ts";
import { Crud } from "./Crud.ts";
import {
  CrudOptionsType,
  CrudParamsType,
  LogRecordsType,
  TaskTypes,
} from "./types.ts";
import { isEmptyObject } from "./validate.ts";
import {
  computeDeleteQueryById,
  computeDeleteQueryByIds,
  computeDeleteQueryByParam,
} from "./helpers/index.ts";
import { AuditLogOptionsType } from "../auditlog/index.ts";

class DeleteRecord extends Crud {
  constructor(params: CrudParamsType, options: CrudOptionsType = {}) {
    super(params, options);
    // Set specific instance properties
    this.currentRecs = [];
  }

  async deleteRecord(): Promise<ResponseMessage> {
    // Check/validate the databases
    const dbCheck = this.checkDb(this.appDb);
    if (dbCheck.code !== "success") {
      return dbCheck;
    }
    const auditDbCheck = this.checkDb(this.auditDb);
    if (auditDbCheck.code !== "success") {
      return auditDbCheck;
    }
    const accessDbCheck = this.checkDb(this.accessDb);
    if (accessDbCheck.code !== "success") {
      return accessDbCheck;
    }
    // delete / remove item(s) by recordId(s)
    if (this.recordIds && this.recordIds.length > 0) {
      try {
        // check task-permission
        if (this.checkAccess) {
          const accessRes = await this.taskPermissionById(TaskTypes.DELETE);
          if (accessRes.code != "success") {
            return accessRes;
          }
        }
        // check if records exist, for delete and audit-log
        if (this.logDelete) {
          const recExistRes = await this.getCurrentRecords("id");
          if (recExistRes.code !== "success") {
            return recExistRes;
          }
        }
        // delete/remove records
        if (this.recordIds.length === 1) {
          return await this.removeRecordById();
        }
        return await this.removeRecordByIds();
      } catch (error) {
        return getResMessage("removeError", {
          message: error.message ? error.message : "Error removing record(s)",
          value: {
            queryParams: this.queryParams,
            recordIds: this.recordIds,
          },
        });
      }
    }
    // delete / remove item(s) by queryParams
    if (this.queryParams && !isEmptyObject(this.queryParams)) {
      try {
        // check task-permission
        if (this.checkAccess) {
          const accessRes = await this.taskPermissionByParams(TaskTypes.DELETE);
          if (accessRes.code != "success") {
            return accessRes;
          }
        }
        if (this.logDelete) {
          const recExistRes = await this.getCurrentRecords("queryParams");
          if (recExistRes.code !== "success") {
            return recExistRes;
          }
        }
        // delete/remove records
        return await this.removeRecordByParams();
      } catch (error) {
        return getResMessage("removeError", {
          message: error.message,
          value: {
            queryParams: this.queryParams,
            recordIds: this.recordIds,
          },
        });
      }
    }

    // could not remove document
    return getResMessage("removeError", {
      value: {
        queryParams: this.queryParams,
        recordIds: this.recordIds,
      },
      message:
        "Unable to perform the requested action(s), due to incomplete/incorrect delete conditions - by recordIds or queryParams only. ",
    });
  }

  async removeRecordById(): Promise<ResponseMessage> {
    try {
      const { deleteQueryObject, ok, message } = computeDeleteQueryById(
        this.table,
        this.recordIds[0],
      );
      if (!ok) {
        return getResMessage("removeError", {
          message: message,
          value: {
            queryParams: this.queryParams,
            recordIds: this.recordIds,
            deleteQuery: deleteQueryObject.deleteQuery,
            fieldValues: deleteQueryObject.fieldValues,
          },
        });
      }
      const res = await this.appDb.queryObject(
        deleteQueryObject.deleteQuery,
        deleteQueryObject.fieldValues,
      ) as QueryObjectResult;
      // delete cache
      const cacheParams: QueryHashCacheParamsType = {
        key: this.cacheKey,
        hash: this.table,
        by: "hash",
      };
      deleteHashCache(cacheParams);
      // check the audit-log settings - to perform audit-log
      let logRes = {
        code: "noLog",
        message: "noLog",
        value: {},
      } as ResponseMessage;
      if (this.logDelete || this.logCrud) {
        const logRecs: LogRecordsType = { logRecords: this.currentRecs };
        const logParams: AuditLogOptionsType = {
          tableName: this.table,
          logRecords: logRecs,
        };
        logRes = await this.transLog.deleteLog(this.userId, logParams);
      }
      return getResMessage("success", {
        message: "Record/document deleted successfully",
        value: {
          recordCount: res.rowCount,
          logRes,
        },
      });
    } catch (e) {
      return getResMessage("removeError", {
        message: `Error removing/deleting record(s): ${
          e.message ? e.message : ""
        }`,
        value: {
          queryParams: this.queryParams,
          recordIds: this.recordIds,
        },
      });
    }
  }

  async removeRecordByIds(): Promise<ResponseMessage> {
    try {
      const { deleteQueryObject, ok, message } = computeDeleteQueryByIds(
        this.table,
        this.recordIds,
      );
      if (!ok) {
        return getResMessage("removeError", {
          message: message,
          value: {
            queryParams: this.queryParams,
            recordIds: this.recordIds,
            deleteQuery: deleteQueryObject.deleteQuery,
            fieldValues: deleteQueryObject.fieldValues,
          },
        });
      }
      const res = await this.appDb.queryObject(
        deleteQueryObject.deleteQuery,
        deleteQueryObject.fieldValues,
      ) as QueryObjectResult;
      // delete cache
      const cacheParams: QueryHashCacheParamsType = {
        key: this.cacheKey,
        hash: this.table,
        by: "hash",
      };
      deleteHashCache(cacheParams);
      // check the audit-log settings - to perform audit-log
      let logRes = {
        code: "noLog",
        message: "noLog",
        value: {},
      } as ResponseMessage;
      if (this.logDelete || this.logCrud) {
        const logRecs: LogRecordsType = { logRecords: this.currentRecs };
        const logParams: AuditLogOptionsType = {
          tableName: this.table,
          logRecords: logRecs,
        };
        logRes = await this.transLog.deleteLog(this.userId, logParams);
      }
      return getResMessage("success", {
        message: "Record/document deleted successfully",
        value: {
          recordCount: res.rowCount,
          logRes,
        },
      });
    } catch (e) {
      return getResMessage("removeError", {
        message: `Error removing/deleting record(s): ${
          e.message ? e.message : ""
        }`,
        value: {
          queryParams: this.queryParams,
          recordIds: this.recordIds,
        },
      });
    }
  }

  async removeRecordByParams(): Promise<ResponseMessage> {
    try {
      if (this.queryParams && !isEmptyObject(this.queryParams)) {
        const { deleteQueryObject, ok, message } = computeDeleteQueryByParam(
          this.table,
          this.queryParams,
        );
        if (!ok) {
          return getResMessage("removeError", {
            message: message,
            value: {
              queryParams: this.queryParams,
              recordIds: this.recordIds,
              deleteQueryObject: deleteQueryObject,
              fieldValues: deleteQueryObject.fieldValues,
            },
          });
        }
        const res = await this.appDb.queryObject(
          deleteQueryObject.deleteQuery,
          deleteQueryObject.fieldValues,
        ) as QueryObjectResult;
        //delete cache
        const cacheParams: QueryHashCacheParamsType = {
          key: this.cacheKey,
          hash: this.table,
          by: "hash",
        };
        deleteHashCache(cacheParams);
        // check the audit-log settings - to perform audit-log
        let logRes = {
          code: "noLog",
          message: "noLog",
          value: {},
        } as ResponseMessage;
        if (this.logDelete || this.logCrud) {
          const logRecs: LogRecordsType = { logRecords: this.currentRecs };
          const logParams: AuditLogOptionsType = {
            tableName: this.table,
            logRecords: logRecs,
          };
          logRes = await this.transLog.deleteLog(this.userId, logParams);
        }
        return getResMessage("success", {
          message: "Record/document deleted successfully",
          value: {
            recordCount: res.rowCount,
            logRes,
          },
        });
      } else {
        return getResMessage("removeError", {
          message: "Unable to delete record(s), due to missing queryParams",
          value: {
            queryParams: this.queryParams,
            recordIds: this.recordIds,
          },
        });
      }
    } catch (e) {
      return getResMessage("removeError", {
        message: `Error removing/deleting record(s): ${
          e.message ? e.message : ""
        }`,
        value: {
          queryParams: this.queryParams,
          recordIds: this.recordIds,
        },
      });
    }
  }
}

// factory function/constructor
function newDeleteRecord(
  params: CrudParamsType,
  options: CrudOptionsType = {},
) {
  return new DeleteRecord(params, options);
}

export { DeleteRecord, newDeleteRecord };
