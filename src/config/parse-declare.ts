import { DeclareRule } from '../core/declare-rule';
import { isFileRef } from '../core/file-ref';
import { InputType, isInputType } from '../core/type/input-type';
import { isType } from '../core/type/type';

interface Inputs {
  [key: string]: InputType;
}

export interface DeclareRaw {
  declare?: unknown;
  inputs?: unknown;
  output?: unknown;
}

export function parseDeclare(ruleName: string, obj: DeclareRaw): DeclareRule|null {
  const {declare, inputs, output} = obj;
  if (!isFileRef(declare)) {
    return null;
  }

  if (!isType(output)) {
    return null;
  }

  if (typeof inputs !== 'object' || !inputs) {
    return null;
  }

  if (!isInputObject(inputs)) {
    return null;
  }

  return {
    name: ruleName,
    processor: declare,
    inputs,
    output,
  };
}

function isInputObject(inputs: object): inputs is Inputs {
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
