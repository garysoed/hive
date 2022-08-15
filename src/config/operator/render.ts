import {$asMap, $map, $recordToMap} from 'gs-tools/export/collect';
import {$pipe} from 'gs-tools/export/typescript';
import {hasPropertiesType, instanceofType, intersectType, mapOfType, notType, stringType, Type} from 'gs-types';

import {RENDER_INPUT_TYPE, RenderInput} from '../../core/render-input';
import {RenderRule} from '../../core/render-rule';
import {RULE_REF_TYPE, RuleRef} from '../../core/rule-ref';
import {RuleType} from '../../core/rule-type';
import {BUILT_IN_PROCESSOR_TYPE, BuiltInProcessorId} from '../../processor/built-in-processor-id';
import {parseFilePattern} from '../parse/parse-file-pattern';
import {parseRuleRef} from '../parse/parse-rule-ref';

type RenderInputRaw = Exclude<RenderInput, RuleRef>|string;
const RENDER_INPUT_RAW_TYPE: Type<RenderInputRaw>
    = intersectType([RENDER_INPUT_TYPE, notType(RULE_REF_TYPE)]);

interface Args {
  readonly inputs: {};
  readonly name: string;
  readonly output: string;
  readonly processor: string;
}

const ARGS_TYPE: Type<Args> = hasPropertiesType({
  inputs: instanceofType(Object),
  name: stringType,
  output: stringType,
  processor: stringType,
});

const INPUTS_TYPE: Type<ReadonlyMap<string, RenderInputRaw>> = mapOfType(
    stringType,
    RENDER_INPUT_RAW_TYPE,
);

export function render(args: unknown): RenderRule {
  ARGS_TYPE.assert(args);

  const inputsMap = $pipe(args.inputs, $recordToMap());
  INPUTS_TYPE.assert(inputsMap);

  const inputs = $pipe(
      inputsMap,
      $map<[string, RenderInputRaw], [string, RenderInput]>(([key, value]) => {
        if (typeof value !== 'string') {
          return [key, value];
        }

        try {
          const ruleRef = parseRuleRef(value);
          return [key, ruleRef];
        } catch (e) {
          return [key, value];
        }
      }),
      $asMap(),
  );

  const output = parseFilePattern(args.output);
  const processor = getProcessor(args.processor);
  return {inputs, name: args.name, output, processor, type: RuleType.RENDER};
}

function getProcessor(raw: string): RuleRef|BuiltInProcessorId {
  try {
    const ruleRef = parseRuleRef(raw);
    return ruleRef;
  } catch (e) {
    BUILT_IN_PROCESSOR_TYPE.assert(raw);
    return raw;
  }
}
