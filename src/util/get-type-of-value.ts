import { Observable, of as observableOf, throwError } from '@rxjs';
import { map, switchMap } from '@rxjs/operators';

import { RenderInput } from '../core/render-input';
import { isRuleRef } from '../core/rule-ref';
import { RuleType } from '../core/rule-type';
import { ConstType } from '../core/type/const-type';
import { BaseType, OutputType } from '../core/type/output-type';

import { readRule } from './read-rule';


export function getTypeOfValue(value: RenderInput): Observable<OutputType|'emptyArray'> {
  if (value instanceof Array) {
    if (value.length <= 0) {
      return observableOf('emptyArray');
    }

    return observableOf({isArray: true, baseType: getBaseType(value[0])});
  }

  if (isRuleRef(value)) {
    return readRule(value).pipe(
        switchMap(rule => {
          switch (rule.type) {
            case RuleType.DECLARE:
              return observableOf({isArray: false, baseType: ConstType.FUNCTION});
            case RuleType.LOAD:
              return observableOf(rule.outputType);
            case RuleType.RENDER:
              return readRule(rule.processor).pipe(
                  map(processorRule => {
                    if (processorRule.type !== RuleType.DECLARE) {
                      throw new Error(`Rule ${rule.processor.path}:${rule.processor.ruleName} is ` +
                          `invalid`);
                    }

                    return processorRule.output;
                  }),
              );
          }
        }),
    );
  }

  return observableOf({isArray: false, baseType: getBaseType(value)});
}

function getBaseType(value: unknown): BaseType {
  switch (typeof value) {
    case 'boolean':
      return ConstType.BOOLEAN;
    case 'number':
      return ConstType.NUMBER;
    case 'string':
      return ConstType.STRING;
    case 'object':
      return ConstType.OBJECT;
    case 'function':
      return ConstType.FUNCTION;
    default:
      throw new Error(`Unsupported value: ${value}`);
  }
}
