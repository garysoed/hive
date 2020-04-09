import { arrayOfType, booleanType, instanceofType, numberType, stringType, Type, unionType } from 'gs-types';

import { RULE_REF_TYPE, RuleRef } from './rule-ref';

export type RenderInput = boolean|number|string|Function|object|
    boolean[]|number[]|string[]|Function[]|object[]|RuleRef;

export type ResolvedRenderInput = Exclude<RenderInput, RuleRef>;

export const RENDER_INPUT_TYPE: Type<RenderInput> = unionType([
  booleanType,
  numberType,
  stringType,
  instanceofType(Function),
  instanceofType(Object),
  unionType([
    arrayOfType(booleanType),
    arrayOfType(numberType),
    arrayOfType(stringType),
    arrayOfType(instanceofType(Function)),
    arrayOfType(instanceofType(Object)),
  ]),
  RULE_REF_TYPE,
]);
