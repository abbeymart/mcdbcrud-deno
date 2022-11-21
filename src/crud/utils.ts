import {
  ActionParamsType,
  ActionParamType,
  CrudParamsType,
  TaskTypes,
} from "./types.ts";
import { getResMessage, ResponseMessage } from "../../deps.ts";
import { isEmptyObject } from "./validate.ts";

// checkTaskType checks and returns the database task type - create, update, delete from actionParams/records.
export function checkTaskType(params: CrudParamsType): string {
  let taskType = TaskTypes.UNKNOWN;
  if (params.actionParams && params.actionParams.length > 0) {
    const actParam = params.actionParams[0];
    if (!actParam["id"] || actParam["id"] === "") {
      if (
        params.actionParams.length === 1 &&
          (params.recordIds && params.recordIds?.length > 0) ||
        params.queryParams && !isEmptyObject(params.queryParams)
      ) {
        taskType = TaskTypes.UPDATE;
      } else {
        taskType = TaskTypes.CREATE;
      }
    } else {
      taskType = TaskTypes.UPDATE;
    }
  }
  return taskType;
}

// validateActionParams function validates the actionParams - must be an array or 1 or more item(s).
export function validateActionParams(
  actParams: ActionParamsType = [],
): ResponseMessage {
  if (actParams.length < 1) {
    return getResMessage("validateError", {
      message:
        "actionParams(record-inputs) must be an array of object values [ActionParamsType].",
    });
  }
  return getResMessage("success");
}

// camelToUnderscore computes and returns the underscore field name for the database table.
export function camelToUnderscore(key: string): string {
  return key.replace(/([A-Z])/g, "_$1").toLowerCase();
}

// camelCase computes and returns the camelCase field name from a sep (default to _) fieldName.
export const toCamelCase = (text: string, sep = "_"): string => {
  // accepts word/text and separator(' ', '_', '__', '.')
  const textArray = text.split(sep);
  // convert the first word to lowercase
  const firstWord = textArray[0].toLowerCase();
  // convert other words: first letter to upper case and other letters to lowercase
  const otherWords = textArray.slice(1).map((item) => {
    // convert first letter to upper case
    const item0 = item[0].toUpperCase();
    // convert other letters to lowercase
    const item1N = item.slice(1).toLowerCase();
    return `${item0}${item1N}`;
  });
  return `${firstWord}${otherWords.join("")}`;
};

// excludeEmptyIdFields excludes undefined or null-value ID fields from the records.
export const excludeEmptyIdFields = (
  records: ActionParamsType,
): ActionParamsType => {
  const actParams: Array<ActionParamType> = [];
  for (const rec of records) {
    const actParam: ActionParamType = {};
    for (const [key, value] of Object.entries(rec)) {
      if ((key === "id" || key.endsWith("Id")) && (!value || value === "")) {
        continue;
      }
      actParam[key] = value;
    }
    actParams.push(actParam);
  }
  return actParams;
};
