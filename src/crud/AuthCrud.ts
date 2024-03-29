/**
 * @Author: abbeymart | Abi Akindele | @Created: 2020-08-20
 * @Company: Copyright 2020 Abi Akindele  | mConnect.biz
 * @License: All Rights Reserved | LICENSE.md
 * @Description: crud operations authorization
 */

import { Crud } from "./Crud.ts";
import { CrudOptionsType, CrudParamsType, TaskTypes } from "./types.ts";
import { ResponseMessage, ValueType, } from "../../deps.ts";

export class AuthCrud<T extends ValueType> extends Crud<T> {
  constructor(params: CrudParamsType, options: CrudOptionsType = {}) {
    super(params, options);
  }

  async authGet(by = "id"): Promise<ResponseMessage<ValueType>> {
    // check/validate action permissions
    if (by.toLowerCase() !== "id") {
      return await this.taskPermissionByParams(TaskTypes.READ);
    } else {
      return await this.taskPermissionById(TaskTypes.READ);
    }
  }

  async authCreate(by = "id"): Promise<ResponseMessage<ValueType>> {
    // check/validate action permissions
    if (by.toLowerCase() !== "id") {
      return await this.taskPermissionByParams(TaskTypes.CREATE);
    } else {
      return await this.taskPermissionById(TaskTypes.CREATE);
    }
  }

  async authUpdate(by = "id"): Promise<ResponseMessage<ValueType>> {
    // check/validate action permissions
    if (by.toLowerCase() !== "id") {
      return await this.taskPermissionByParams(TaskTypes.UPDATE);
    } else {
      return await this.taskPermissionById(TaskTypes.UPDATE);
    }
  }

  async authDelete(by = "id"): Promise<ResponseMessage<ValueType>> {
    // check/validate action
    if (by.toLowerCase() !== "id") {
      return await this.taskPermissionByParams(TaskTypes.DELETE);
    } else {
      return await this.taskPermissionById(TaskTypes.DELETE);
    }
  }
}

// factory function
export function newAuthCrud(
  params: CrudParamsType,
  options: CrudOptionsType = {},
) {
  return new AuthCrud(params, options);
}
