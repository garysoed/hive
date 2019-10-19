import { BooleanType, HasPropertiesType, InstanceofType } from '@gs-types';

export interface InputType {
  readonly isArray: boolean;
  readonly matcher: RegExp;
}

const INPUT_TYPE_TYPE = HasPropertiesType<InputType>({
  isArray: BooleanType,
  matcher: InstanceofType(RegExp),
});

export function isInputType(obj: unknown): obj is InputType {
  return INPUT_TYPE_TYPE.check(obj);
}
