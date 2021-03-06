/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as jsonpath from "jsonpath";

export type JsonPathComponent = jsonpath.PathComponent;
export type JsonPath = JsonPathComponent[];

export function parse(jsonPath: string): JsonPath {
  return jsonpath.parse(jsonPath).map(part => part.expression.value).slice(1);
}

export function stringify(jsonPath: JsonPath): string {
  return jsonpath.stringify(["$" as JsonPathComponent].concat(jsonPath));
}

export function paths<T>(obj: T, jsonQuery: string): JsonPath[] {
  return jsonpath.paths(obj, jsonQuery).map(x => x.slice(1));
}

export function nodes<T>(obj: T, jsonQuery: string): { path: JsonPath, value: any }[] {
  return jsonpath.nodes(obj, jsonQuery).map(x => { return { path: x.path.slice(1), value: x.value }; });
}

export function IsPrefix(prefix: JsonPath, path: JsonPath): boolean {
  if (prefix.length > path.length) {
    return false;
  }
  for (let i = 0; i < prefix.length; ++i) {
    if (prefix[i] !== path[i]) {
      return false;
    }
  }
  return true;
}

export function CreateObject(jsonPath: JsonPath, leafObject: any): any {
  let obj = leafObject;
  for (const jsonPathComponent of jsonPath.reverse()) {
    obj = typeof jsonPathComponent === "number"
      ? (() => { const result = Array.apply(null, Array(jsonPathComponent + 1)); result[jsonPathComponent] = obj; return result; })()
      : (() => { const result: any = {}; result[jsonPathComponent] = obj; return result; })();
  }
  return obj;
}

export function matches(jsonQuery: string, jsonPath: JsonPath): boolean {
  // build dummy object from `jsonPath`
  const leafNode = new Object();
  const obj = CreateObject(jsonPath, leafNode);

  // check that `jsonQuery` on that object returns the `leafNode`
  return nodes(obj, jsonQuery).some(res => res.value === leafNode);
}