import { HasPropertiesType, InstanceofType } from '@gs-types';

export interface InputType {
  matcher: RegExp;
}

const INPUT_TYPE_TYPE = HasPropertiesType<InputType>({
  matcher: InstanceofType(RegExp),
});

export function isInputType(obj: unknown): obj is InputType {
  return INPUT_TYPE_TYPE.check(obj);
}
