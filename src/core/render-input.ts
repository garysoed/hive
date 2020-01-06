import { arrayOfType, BooleanType, InstanceofType, NumberType, StringType, Type, UnionType } from '@gs-types';

import { RULE_REF_TYPE, RuleRef } from './rule-ref';

export type RenderInput = boolean|number|string|Function|object|
    boolean[]|number[]|string[]|Function[]|object[]|RuleRef;

export type ResolvedRenderInput = Exclude<RenderInput, RuleRef>;

export const RENDER_INPUT_TYPE: Type<RenderInput> = UnionType([
  BooleanType,
  NumberType,
  StringType,
  InstanceofType(Function),
  InstanceofType(Object),
  UnionType([
    arrayOfType(BooleanType),
    arrayOfType(NumberType),
    arrayOfType(StringType),
    arrayOfType(InstanceofType(Function)),
    arrayOfType(InstanceofType(Object)),
  ]),
  RULE_REF_TYPE,
]);
