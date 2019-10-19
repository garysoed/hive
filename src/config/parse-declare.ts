import { DeclareRule } from '../core/declare-rule';
import { isFileRef } from '../core/file-ref';
import { RuleType } from '../core/rule-type';
import { InputType, isInputType } from '../core/type/input-type';
import { isOutputType } from '../core/type/output-type';

import { objectToMap } from './object-to-map';


export interface DeclareRaw {
  declare?: unknown;
  inputs?: unknown;
  output?: unknown;
}

export function parseDeclare(ruleName: string, obj: DeclareRaw): DeclareRule|null {
  const {declare, output} = obj;
  if (!isFileRef(declare)) {
    return null;
  }

  if (!isOutputType(output)) {
    return null;
  }

  const inputs = obj.inputs || {};
  if (typeof inputs !== 'object' || !inputs) {
    return null;
  }

  if (!isInputObject(inputs)) {
    return null;
  }

  return {
    name: ruleName,
    processor: declare,
    inputs: objectToMap(inputs),
    output,
    type: RuleType.DECLARE,
  };
}

function isInputObject(inputs: object): inputs is {[key: string]: InputType} {
  const inputsObj = inputs as {[key: string]: unknown};

  for (const key in inputs) {
    if (!inputs.hasOwnProperty(key)) {
      continue;
    }

    if (!isInputType(inputsObj[key])) {
      return false;
    }
  }

  return true;
}
