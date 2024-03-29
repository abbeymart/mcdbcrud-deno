/**
 * @Author: abbeymart | Abi Akindele | @Created: 2020-07-15
 * @Company: Copyright 2020 Abi Akindele  | mConnect.biz
 * @License: All Rights Reserved | LICENSE.md
 * @Description: audit-log (postgres-db) entry point
 */

// Import required module/function
import {
    getResMessage,
    PoolClient,
    QueryOptions,
    ResponseMessage,
    ValueType,
} from "../../deps.ts";
import { checkDb } from "../dbc/index.ts";
import {
    isEmptyObject,
    LogRecordsType,
    ObjectType,
} from "../crud/index.ts";

//types
export interface AuditLogOptionsType {
    tableName: string;
    logRecords?: LogRecordsType;
    newLogRecords?: LogRecordsType;
    recordParams?: LogRecordsType;
    newRecordParams?: LogRecordsType;
    auditTable?: string;
}

export interface AuditParamsType {
    tableName: string;
    logRecords?: ValueType;
    newLogRecords?: ValueType;
    logType: string;
    logBy?: string;
    logAt?: Date;
}

export enum AuditLogTypes {
    CREATE = "create",
    UPDATE = "update",
    DELETE = "delete",
    REMOVE = "remove",
    GET = "get",
    READ = "read",
    LOGIN = "login",
    LOGOUT = "logout",
}

class AuditLog {
    private readonly dbHandle: PoolClient;
    private readonly auditTable: string;

    constructor(auditDb: PoolClient, auditTable = "audits") {
        this.dbHandle = auditDb;
        this.auditTable = auditTable;
    }

    getAuditTable(): string {
        return this.auditTable;
    }

    async createLog<T extends ValueType>(
        userId: string,
        logParams: AuditLogOptionsType,
    ): Promise<ResponseMessage<T>> {
        const dbCheck = checkDb<T>(this.dbHandle);
        if (dbCheck.code !== "success") {
            return dbCheck;
        }
        // Check/validate the attributes / parameters
        let errorMessage = "";
        if (!userId || userId === "") {
            errorMessage = errorMessage
                ? errorMessage + " | userId is required."
                : "userId is required.";
        }
        if (!logParams.tableName || logParams.tableName === "") {
            errorMessage = errorMessage
                ? errorMessage + " | Table or Collection name is required."
                : "Table or Collection name is required.";
        }
        if (
            !logParams.logRecords || isEmptyObject(logParams.logRecords as ObjectType)
        ) {
            errorMessage = errorMessage
                ? errorMessage + " | Created record(s) information is required."
                : "Created record(s) information is required.";
        }
        if (errorMessage || errorMessage !== "") {
            console.log("error-message: ", errorMessage);
            return getResMessage("paramsError", {
                message: errorMessage,
            });
        }

        try {
            // insert audit record
            const queryText =
                `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_by, log_at) VALUES($1, $2, $3, $4, $5);`;
            const values = [
                logParams.tableName,
                logParams.logRecords,
                AuditLogTypes.CREATE,
                userId,
                new Date(),
            ];
            const query: QueryOptions = {
                text: queryText,
                args: values,
            };
            const res = await this.dbHandle.queryObject(query);
            if (res.rowCount && res.rowCount > 0) {
                return getResMessage("success", {
                    value: res as T,
                });
            } else {
                return getResMessage("insertError", {
                    value  : res as T,
                    message: "create-log-records-error",
                });
            }
        } catch (error) {
            console.error("Error saving create-audit record(s): ", error);
            return getResMessage("logError", {
                message: "Error saving create-audit record(s): " + error.message,
                value  : error,
            });
        }
    }

    async updateLog<T extends ValueType>(
        userId: string,
        logParams: AuditLogOptionsType,
    ): Promise<ResponseMessage<T>> {
        const dbCheck = checkDb<T>(this.dbHandle);
        if (dbCheck.code !== "success") {
            return dbCheck;
        }
        // Check/validate the attributes / parameters
        let errorMessage = "";
        if (!userId || userId === "") {
            errorMessage = errorMessage
                ? errorMessage + " | userId is required."
                : "userId is required.";
        }
        if (!logParams.tableName || logParams.tableName === "") {
            errorMessage = errorMessage
                ? errorMessage + " | Table or Collection name is required."
                : "Table or Collection name is required.";
        }
        if (
            !logParams.logRecords || isEmptyObject(logParams.logRecords as ObjectType)
        ) {
            errorMessage = errorMessage
                ? errorMessage + " | Current record(s) information is required."
                : "Current record(s) information is required.";
        }
        if (
            !logParams.newLogRecords ||
            isEmptyObject(logParams.newLogRecords as ObjectType)
        ) {
            errorMessage = errorMessage
                ? errorMessage + " | Updated record(s) information is required."
                : "Updated record(s) information is required.";
        }
        if (errorMessage || errorMessage !== "") {
            return getResMessage("paramsError", {
                message: errorMessage,
            });
        }

        try {
            // insert audit record
            const queryText =
                `INSERT INTO ${this.auditTable}(table_name, log_records, new_log_records, log_type, log_by, log_at ) VALUES($1, $2, $3, $4, $5, $6);`;
            const values = [
                logParams.tableName,
                logParams.logRecords,
                logParams.newLogRecords,
                AuditLogTypes.UPDATE,
                userId,
                new Date(),
            ];
            const query: QueryOptions = {
                text: queryText,
                args: values,
            };
            const res = await this.dbHandle.queryObject(query);
            if (res.rowCount && res.rowCount > 0) {
                return getResMessage("success", {
                    value: res as T,
                });
            } else {
                return getResMessage("insertError", {
                    value  : res as T,
                    message: "create-log-records-error",
                });
            }
        } catch (error) {
            console.error("Error saving update-audit record(s): ", error);
            return getResMessage("insertError", {
                value  : error,
                message: "Error saving update-audit record(s): " + error.message,
            });
        }
    }

    async readLog<T extends ValueType>(
        logParams: AuditLogOptionsType,
        userId = "",
    ): Promise<ResponseMessage<T>> {
        const dbCheck = checkDb<T>(this.dbHandle);
        if (dbCheck.code !== "success") {
            return dbCheck;
        }
        // validate params/values
        let errorMessage = "";
        if (!logParams.tableName || logParams.tableName === "") {
            errorMessage = errorMessage
                ? errorMessage + " | Table or Collection name is required."
                : "Table or Collection name is required.";
        }
        if (
            !logParams.logRecords || isEmptyObject(logParams.logRecords as ObjectType)
        ) {
            errorMessage = errorMessage
                ? errorMessage +
                " | Search keywords or Read record(s) information is required."
                : "Search keywords or Read record(s) information is required.";
        }
        if (errorMessage || errorMessage !== "") {
            return getResMessage("paramsError", {
                message: errorMessage,
            });
        }

        try {
            // insert audit record
            let queryText: string;
            let values: Array<ValueType | LogRecordsType>;
            if (userId || userId !== "") {
                queryText =
                    `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_by, log_at ) VALUES($1, $2, $3, $4, $5);`;
                values = [
                    logParams.tableName,
                    logParams.logRecords as LogRecordsType,
                    AuditLogTypes.READ,
                    userId,
                    new Date(),
                ];
            } else {
                queryText =
                    `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_at ) VALUES($1, $2, $3, $4);`;
                values = [
                    logParams.tableName,
                    logParams.logRecords as LogRecordsType,
                    AuditLogTypes.READ,
                    new Date(),
                ];
            }
            const query: QueryOptions = {
                text: queryText,
                args: values,
            };
            const res = await this.dbHandle.queryObject(query);
            if (res.rowCount && res.rowCount > 0) {
                return getResMessage("success", {
                    value: res as T,
                });
            } else {
                return getResMessage("insertError", {
                    value  : res as T,
                    message: "create-log-records-error",
                });
            }
        } catch (error) {
            console.error("Error inserting read/search-audit record(s): ", error);
            return getResMessage("insertError", {
                value  : error,
                message: "Error inserting read/search-audit record(s):" + error.message,
            });
        }
    }

    async deleteLog<T extends ValueType>(
        userId: string,
        logParams: AuditLogOptionsType,
    ): Promise<ResponseMessage<T>> {
        const dbCheck = checkDb<T>(this.dbHandle);
        if (dbCheck.code !== "success") {
            return dbCheck;
        }
        // Check/validate the attributes / parameters
        let errorMessage = "";
        if (!userId || userId === "") {
            errorMessage = errorMessage
                ? errorMessage + " | userId is required."
                : "userId is required.";
        }
        if (!logParams.tableName || logParams.tableName === "") {
            errorMessage = errorMessage
                ? errorMessage + " | Table or Collection name is required."
                : "Table or Collection name is required.";
        }
        if (
            !logParams.logRecords || isEmptyObject(logParams.logRecords as ObjectType)
        ) {
            errorMessage = errorMessage
                ? errorMessage + " | Deleted record(s) information is required."
                : "Deleted record(s) information is required.";
        }
        if (errorMessage || errorMessage !== "") {
            return getResMessage("paramsError", {
                message: errorMessage,
            });
        }

        try {
            // insert audit record
            const queryText =
                `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_by, log_at ) VALUES($1, $2, $3, $4, $5);`;
            const values = [
                logParams.tableName,
                logParams.logRecords,
                AuditLogTypes.DELETE,
                userId,
                new Date(),
            ];
            const query: QueryOptions = {
                text: queryText,
                args: values,
            };
            const res = await this.dbHandle.queryObject(query);
            if (res.rowCount && res.rowCount > 0) {
                return getResMessage("success", {
                    value: res as T,
                });
            } else {
                return getResMessage("insertError", {
                    value  : res as T,
                    message: "create-log-records-error",
                });
            }
        } catch (error) {
            console.log("Error saving delete-audit record(s): ", error);
            return getResMessage("insertError", {
                value  : error,
                message: "Error inserting delete-audit record(s):" + error.message,
            });
        }
    }

    async loginLog<T extends ValueType>(
        logParams: AuditLogOptionsType,
        userId = "",
        tableName = "users",
    ): Promise<ResponseMessage<T>> {
        const dbCheck = checkDb<T>(this.dbHandle);
        if (dbCheck.code !== "success") {
            return dbCheck;
        }
        // validate params/values
        let errorMessage = "";
        const logTableName = logParams.tableName || tableName;
        if (
            !logParams.logRecords || isEmptyObject(logParams.logRecords as ObjectType)
        ) {
            errorMessage = errorMessage + " | Login information is required.";
        }
        if (errorMessage || errorMessage !== "") {
            return getResMessage("paramsError", {
                message: errorMessage,
            });
        }

        try {
            // insert audit record
            let queryText: string;
            let values: Array<ValueType | LogRecordsType>;
            if (userId || userId !== "") {
                queryText =
                    `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_by, log_at ) VALUES($1, $2, $3, $4, $5);`;
                values = [
                    logTableName,
                    logParams.logRecords as LogRecordsType,
                    AuditLogTypes.LOGIN,
                    userId,
                    new Date(),
                ];
            } else {
                queryText =
                    `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_at ) VALUES($1, $2, $3, $4);`;
                values = [
                    logTableName,
                    logParams.logRecords as LogRecordsType,
                    AuditLogTypes.LOGIN,
                    new Date(),
                ];
            }
            const query: QueryOptions = {
                text: queryText,
                args: values,
            };
            const res = await this.dbHandle.queryObject(query);
            if (res.rowCount && res.rowCount > 0) {
                return getResMessage("success", {
                    value: res as T,
                });
            } else {
                return getResMessage("insertError", {
                    value  : res as T,
                    message: "create-log-records-error",
                });
            }
        } catch (error) {
            console.log("Error inserting login-audit record(s): ", error);
            return getResMessage("insertError", {
                value  : error,
                message: "Error inserting login-audit record(s):" + error.message,
            });
        }
    }

    async logoutLog<T extends ValueType>(
        userId: string,
        logParams: AuditLogOptionsType,
        tableName = "users",
    ): Promise<ResponseMessage<T>> {
        const dbCheck = checkDb<T>(this.dbHandle);
        if (dbCheck.code !== "success") {
            return dbCheck;
        }
        // validate params/values
        let errorMessage = "";
        const logTableName = logParams.tableName || tableName;
        if (!userId || userId === "") {
            errorMessage = errorMessage + " | userId is required.";
        }
        if (
            !logParams.logRecords || isEmptyObject(logParams.logRecords as ObjectType)
        ) {
            errorMessage = errorMessage + " | Logout information is required.";
        }
        if (errorMessage || errorMessage !== "") {
            return getResMessage("paramsError", {
                message: errorMessage,
            });
        }

        try {
            // insert audit record
            const queryText =
                `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_by, log_at ) VALUES($1, $2, $3, $4, $5);`;
            const values = [
                logTableName,
                logParams.logRecords,
                AuditLogTypes.LOGOUT,
                userId,
                new Date(),
            ];
            const query: QueryOptions = {
                text: queryText,
                args: values,
            };
            const res = await this.dbHandle.queryObject(query);
            if (res.rowCount && res.rowCount > 0) {
                return getResMessage("success", {
                    value: res as T,
                });
            } else {
                return getResMessage("insertError", {
                    value  : res as T,
                    message: "create-log-records-error",
                });
            }
        } catch (error) {
            console.log("Error inserting logout-audit record(s): ", error);
            return getResMessage("insertError", {
                value  : error,
                message: "Error inserting login-audit record(s):" + error.message,
            });
        }
    }

    async auditLog<T extends ValueType>(logType: string, logParams: AuditLogOptionsType, userId = ""): Promise<ResponseMessage<T>> {
        const dbCheck = checkDb<T>(this.dbHandle);
        if (dbCheck.code !== "success") {
            return dbCheck;
        }
        // Check/validate the attributes / parameters by logTypes (create, update, delete, read, login, logout...)
        let errorMessage = "",
            query: QueryOptions;

        // set share variable-values
        logType = logType.toLowerCase();
        let tableName = logParams && logParams.tableName ? logParams.tableName : "";
        const logRecords =
            logParams && logParams.logRecords && !isEmptyObject(logParams.logRecords as ObjectType)
                ? logParams.logRecords
                : {};
        const newLogRecords = logParams && logParams.newLogRecords &&
        !isEmptyObject(logParams.newLogRecords as ObjectType)
            ? logParams.newLogRecords
            : {}; // object or array

        switch (logType) {
            case "create":
            case AuditLogTypes.CREATE: {
                // validate params/values
                if (!tableName || tableName === "") {
                    errorMessage = errorMessage
                        ? errorMessage + " | Table or Collection name is required."
                        : "Table or Collection name is required.";
                }
                if (!userId || userId === "") {
                    errorMessage = errorMessage
                        ? errorMessage + " | userId is required."
                        : "userId is required.";
                }
                if (!logRecords || isEmptyObject(logRecords as ObjectType)) {
                    errorMessage = errorMessage
                        ? errorMessage + " | Created record(s) information is required."
                        : "Created record(s) information is required.";
                }
                if (errorMessage || errorMessage !== "") {
                    return getResMessage("paramsError", {
                        message: errorMessage,
                    });
                }

                query = {
                    text:
                        `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_by, log_at ) VALUES($1, $2, $3, $4, $5);`,
                    args: [
                        tableName,
                        logRecords,
                        AuditLogTypes.CREATE,
                        userId,
                        new Date(),
                    ],
                };
                break;
            }
            case "update":
            case AuditLogTypes.UPDATE: {
                // validate params/values
                if (!tableName || tableName === "") {
                    errorMessage = errorMessage
                        ? errorMessage + " | Table or Collection name is required."
                        : "Table or Collection name is required.";
                }
                if (!userId || userId === "") {
                    errorMessage = errorMessage
                        ? errorMessage + " | userId is required."
                        : "userId is required.";
                }
                if (!logRecords || isEmptyObject(logRecords as ObjectType)) {
                    errorMessage = errorMessage
                        ? errorMessage + " | Current record(s) information is required."
                        : "Current record(s) information is required.";
                }
                if (!newLogRecords || isEmptyObject(newLogRecords as ObjectType)) {
                    errorMessage = errorMessage
                        ? errorMessage + " | Updated record(s) information is required."
                        : "Updated record(s) information is required.";
                }
                if (errorMessage || errorMessage !== "") {
                    return getResMessage("paramsError", {
                        message: errorMessage,
                    });
                }
                query = {
                    text:
                        `INSERT INTO ${this.auditTable}(table_name, log_records, new_log_records, log_type, log_by, log_at ) VALUES($1, $2, $3, $4, $5, $6);`,
                    args: [
                        tableName,
                        logRecords,
                        newLogRecords,
                        AuditLogTypes.UPDATE,
                        userId,
                        new Date(),
                    ],
                };
                break;
            }
            case "remove":
            case "delete":
            case AuditLogTypes.DELETE:
            case AuditLogTypes.REMOVE: {
                // Check/validate the attributes / parameters
                if (!tableName || tableName === "") {
                    errorMessage = errorMessage
                        ? errorMessage + " | Table or Collection name is required."
                        : "Table or Collection name is required.";
                }
                if (!userId || userId === "") {
                    errorMessage = errorMessage
                        ? errorMessage + " | userId is required."
                        : "userId is required.";
                }
                if (!logRecords || isEmptyObject(logRecords as ObjectType)) {
                    errorMessage = errorMessage
                        ? errorMessage + " | Deleted record(s) information is required."
                        : "Deleted record(s) information is required.";
                }
                if (errorMessage || errorMessage !== "") {
                    return getResMessage("paramsError", {
                        message: errorMessage,
                    });
                }
                query = {
                    text:
                        `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_by, log_at ) VALUES($1, $2, $3, $4, $5);`,
                    args: [
                        tableName,
                        logRecords,
                        AuditLogTypes.DELETE,
                        userId,
                        new Date(),
                    ],
                };
                break;
            }
            case "read":
            case AuditLogTypes.GET:
            case AuditLogTypes.READ: {
                // validate params/values
                if (!tableName || tableName === "") {
                    errorMessage = errorMessage
                        ? errorMessage + " | Table or Collection name is required."
                        : "Table or Collection name is required.";
                }
                if (!logRecords || isEmptyObject(logRecords as ObjectType)) {
                    errorMessage = errorMessage
                        ? errorMessage +
                        " | Search keywords or Read record(s) information is required."
                        : "Search keywords or Read record(s) information is required.";
                }
                if (errorMessage || errorMessage !== "") {
                    return getResMessage("paramsError", {
                        message: errorMessage,
                    });
                }

                let queryTextRead: string;
                let valuesRead: Array<ValueType | LogRecordsType>;
                if (userId || userId !== "") {
                    queryTextRead =
                        `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_by, log_at ) VALUES($1, $2, $3, $4, $5);`;
                    valuesRead = [
                        tableName,
                        logRecords,
                        AuditLogTypes.READ,
                        userId,
                        new Date(),
                    ];
                } else {
                    queryTextRead = "INSERT INTO " + this.auditTable +
                        " (table_name, log_records, log_type, log_at ) VALUES($1, $2, $3, $4);";
                    valuesRead = [tableName, logRecords, AuditLogTypes.READ, new Date()];
                }
                query = {
                    text: queryTextRead,
                    args: valuesRead,
                };
                break;
            }
            case "login":
            case AuditLogTypes.LOGIN: {
                // validate params/values
                if (!logRecords || isEmptyObject(logRecords as ObjectType)) {
                    errorMessage = errorMessage + " | Login information is required.";
                }
                if (errorMessage || errorMessage !== "") {
                    return getResMessage("paramsError", {
                        message: errorMessage,
                    });
                }
                tableName = tableName || "users";
                let queryTextLogin: string;
                let valuesLogin: Array<ValueType | LogRecordsType>;
                if (userId || userId !== "") {
                    queryTextLogin =
                        `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_by, log_at ) VALUES($1, $2, $3, $4, $5);`;
                    valuesLogin = [
                        tableName,
                        logRecords,
                        AuditLogTypes.LOGIN,
                        userId,
                        new Date(),
                    ];
                } else {
                    queryTextLogin = "INSERT INTO " + this.auditTable +
                        " (table_name, log_records, log_type, log_at ) VALUES($1, $2, $3, $4);";
                    valuesLogin = [
                        tableName,
                        logRecords,
                        AuditLogTypes.LOGIN,
                        new Date(),
                    ];
                }
                query = {
                    text: queryTextLogin,
                    args: valuesLogin,
                };
                break;
            }
            case "logout":
            case AuditLogTypes.LOGOUT:
                // validate params/values
                if (!userId || userId === "") {
                    errorMessage = errorMessage + " | userId is required.";
                }
                if (!logRecords || isEmptyObject(logRecords as ObjectType)) {
                    errorMessage = errorMessage + " | Logout information is required.";
                }
                if (errorMessage || errorMessage !== "") {
                    return getResMessage("paramsError", {
                        message: errorMessage,
                    });
                }
                tableName = tableName || "users";
                query = {
                    text:
                        `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_by, log_at ) VALUES($1, $2, $3, $4, $5);`,
                    args: [
                        tableName,
                        logRecords,
                        AuditLogTypes.LOGOUT,
                        userId,
                        new Date(),
                    ],
                };
                break;
            default:
                return getResMessage("insertError", {
                    message: "Unknown log type and/or incomplete log information",
                });
        }
        // perform insert task - insert audit record
        try {
            const res = await this.dbHandle.queryObject(query);
            if (res.rowCount && res.rowCount > 0) {
                return getResMessage("success", {
                    value: res as T,
                });
            } else {
                return getResMessage("insertError", {
                    value  : res as T,
                    message: "create-log-records-error",
                });
            }
        } catch (error) {
            console.log("Error saving audit-log record(s): ", error);
            return getResMessage("insertError", {
                value  : error,
                message: "Error inserting audit-log record(s):" + error.message,
            });
        }
    }

    async customLog<T extends ValueType>(params: AuditParamsType): Promise<ResponseMessage<T>> {
        const dbCheck = checkDb<T>(this.dbHandle);
        if (dbCheck.code !== "success") {
            return dbCheck;
        }

        // Check/validate the attributes / parameters
        let errorMessage = "";
        if (!params.logRecords) {
            errorMessage = errorMessage ? errorMessage + " | Data / information to be logged is required." :
                "Data / information to be logged is required.";
        }
        if (!params.logBy) {
            errorMessage = errorMessage ? errorMessage + " | Log userId/name or owner required." :
                "Log userId/name or owner required.";
        }
        if (errorMessage) {
            console.log("error-message: ", errorMessage);
            return getResMessage("paramsError", {
                message: errorMessage,
            });
        }
        // set optional default values
        params.tableName = params.tableName || "not-specified"
        params.logType = params.logType || AuditLogTypes.CREATE

        try {
            // insert audit record
            const queryText =
                `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_by, log_at) VALUES($1, $2, $3, $4, $5);`;
            const values = [
                params.tableName,
                params.logRecords,
                params.logType,
                params.logBy,
                new Date(),
            ];
            const query: QueryOptions = {
                text: queryText,
                args: values,
            };
            const res = await this.dbHandle.queryObject(query);
            if (res.rowCount && res.rowCount > 0) {
                return getResMessage("success", {
                    value: res as T,
                });
            } else {
                return getResMessage("insertError", {
                    value  : res as T,
                    message: "create-log-records-error",
                });
            }
        } catch (error) {
            console.log("Error saving audit-log-record(s): ", error);
            return getResMessage("logError", {
                value  : error.message,
                message: "Error saving audit-log-record(s): " + error.message,
            });
        }
    }

}

function newAuditLog(auditDb: PoolClient, auditTable = "audits") {
    return new AuditLog(auditDb, auditTable);
}

export { AuditLog, newAuditLog };
