import { $, $recordToMap } from '@gs-tools/collect';
import { hasPropertiesType, instanceofType, mapOfType, stringType, Type } from '@gs-types';

import { DeclareRule } from '../../core/declare-rule';
import { RuleType } from '../../core/rule-type';
import { parseFileRef } from '../parse/parse-file-ref';


interface Args {
  readonly inputs: {};
  readonly name: string;
  readonly processor: string;
}

const ARGS_TYPE: Type<Args> = hasPropertiesType({
  inputs: instanceofType(Object),
  name: stringType,
  processor: stringType,
});

const INPUTS_TYPE: Type<ReadonlyMap<string, Type<unknown>>> =
    mapOfType(stringType, instanceofType(Type));

export function declare(args: unknown): DeclareRule {
  ARGS_TYPE.assert(args);

  const inputs = $(args.inputs, $recordToMap());
  INPUTS_TYPE.assert(inputs);

  const processor = parseFileRef(args.processor);
  return {inputs, name: args.name, processor, type: RuleType.DECLARE};
}
