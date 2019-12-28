import { $, $asMap, $map, $recordToMap } from '@gs-tools/collect';
import { HasPropertiesType, InstanceofType, MapOfType, StringType, Type } from '@gs-types';

import { DeclareRule } from '../../core/declare-rule';
import { RuleType } from '../../core/rule-type';
import { InputType } from '../../core/type/input-type';
import { parseFileRef } from '../parse/parse-file-ref';
import { parseInputType } from '../parse/parse-input-type';
import { parseOutputType } from '../parse/parse-output-type';


interface Args {
  readonly inputs: {};
  readonly name: string;
  readonly output: string;
  readonly processor: string;
}

const ARGS_TYPE: Type<Args> = HasPropertiesType({
  inputs: InstanceofType(Object),
  name: StringType,
  output: StringType,
  processor: StringType,
});

const INPUTS_TYPE: Type<ReadonlyMap<string, string>> = MapOfType(StringType, StringType);

export function declare(args: unknown): DeclareRule {
  ARGS_TYPE.assert(args);

  const inputsMap = $(args.inputs, $recordToMap());
  INPUTS_TYPE.assert(inputsMap);

  const inputs = $(
      inputsMap,
      $map(([key, inputRaw]) => [key, parseInputType(inputRaw)] as [string, InputType]),
      $asMap(),
  );

  const output = parseOutputType(args.output);
  const processor = parseFileRef(args.processor);
  return {inputs, name: args.name, output, processor, type: RuleType.DECLARE};
}
