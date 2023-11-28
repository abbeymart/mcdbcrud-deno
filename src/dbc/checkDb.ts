/**
 * @Author: abbeymart | Abi Akindele | @Created: 2020-08-07, 2023-11-27
 * @Company: Copyright 2020 Abi Akindele  | mConnect.biz
 * @License: All Rights Reserved | LICENSE.md
 * @Description: check-db connection / handle
 */

import { getResMessage, PoolClient, ResponseMessage, ValueType } from "../../deps.ts";
import { DbConnectionType } from "./types.ts";

export function checkDb<T extends ValueType>(db: DbConnectionType): ResponseMessage<T> {
  if (db) {
    return getResMessage("success", {
      message: "valid database",
    });
  } else {
    return getResMessage("validateError", {
      message: "valid database is required",
    });
  }
}

export function checkDbClient<T extends ValueType>(dbConnect: PoolClient): ResponseMessage<T> {
  if (dbConnect) {
    return getResMessage("success", {
      message: "valid database connection/handler",
    });
  } else {
    return getResMessage("validateError", {
      message: "valid database connection/handler is required",
    });
  }
}
