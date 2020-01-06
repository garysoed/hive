import { ConstType } from '../core/type/const-type';


export function parseConst(str: string, type: ConstType): boolean|number|Function|object|string {
  switch (type) {
    case ConstType.BOOLEAN:
      return str === 'true';
    case ConstType.NUMBER:
      return Number.parseFloat(str);
    case ConstType.FUNCTION:
      // tslint:disable-next-line: no-eval
      const result = eval(str);
      if (!(result instanceof Function)) {
        throw new Error(`String ${str} does not result in a function`);
      }
      return result;
    case ConstType.OBJECT:
      return JSON.parse(str);
    case ConstType.STRING:
      return str;
  }
}
