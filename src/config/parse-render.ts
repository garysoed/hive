import { isFilePattern } from '../core/file-pattern';
import { RenderInput } from '../core/render-input';
import { RenderRule } from '../core/render-rule';
import { isRuleRef } from '../core/rule-ref';
import { RuleType } from '../core/rule-type';

import { objectToMap } from './object-to-map';


const RENDER_INPUT_TYPES = new Set([
  'boolean',
  'number',
  'string',
  'object',
  'function',
]);

export interface RenderRaw {
  inputs?: unknown;
  processor?: unknown;
  render?: unknown;
}

export function parseRender(ruleName: string, obj: RenderRaw): RenderRule|null {
  const {render, processor} = obj;
  if (!isFilePattern(render)) {
    return null;
  }

  if (!isRuleRef(processor)) {
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
    processor,
    inputs: objectToMap(inputs),
    output: render,
    type: RuleType.RENDER,
  };
}

function isInputObject(inputs: object): inputs is {[key: string]: RenderInput} {
  const inputsObj = inputs as {[key: string]: unknown};

  for (const key in inputs) {
    if (!inputs.hasOwnProperty(key)) {
      continue;
    }

    if (!isRenderInput(inputsObj[key])) {
      return false;
    }
  }

  return true;
}

function isRenderInput(input: unknown): input is RenderInput {
  if (isRuleRef(input)) {
    return true;
  }

  if (input instanceof Array) {
    if (input.length <= 0) {
      return true;
    }

    const [element] = input;
    return RENDER_INPUT_TYPES.has(typeof element);
  }

  return RENDER_INPUT_TYPES.has(typeof input);
}
