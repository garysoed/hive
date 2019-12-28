import { InputType } from '../../core/type/input-type';


export function parseInputType(raw: string): InputType {
  if (!raw) {
    throw new Error('Input type is empty');
  }

  const [pattern, flags] = raw.trim().split(':');
  if ((flags || '').endsWith('[]')) {
    return {isArray: true, matcher: new RegExp(pattern, flags.substr(0, flags.length - 2))};
  }

  return {isArray: false, matcher: new RegExp(pattern, flags)};
}
