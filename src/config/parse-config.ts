import { arrayOfType, booleanType, equalType, hasPropertiesType, instanceofType, intersectType, iterableOfType, mapOfType, nullType, numberType, setOfType, stringType, undefinedType, unionType, unknownType } from '@gs-types';

import { ConfigFile } from '../core/config-file';
import { Rule } from '../core/rule';
import { GOOGLE_SHEETS_METADATA_TYPE } from '../thirdparty/google-sheets-metadata';

import { declare } from './operator/declare';
import { glob } from './operator/glob';
import { load } from './operator/load';
import { render } from './operator/render';
import { fromItemType } from './serializer/array-serializer';
import { fromType } from './serializer/serializer';
import { StringSerializer } from './serializer/string-serializer';


export function parseConfig(content: string): ConfigFile {
  const fn = Function(
      'declare',
      'load',
      'render',
      // Utils
      'as',
      'glob',
      'type',
      content,
  );
  const rules = new Map<string, Rule>();
  fn(
      makeHiveRuleFn(declare, rules),
      makeHiveRuleFn(load, rules),
      makeHiveRuleFn(render, rules),
      {
        boolean: fromType(booleanType),
        number: fromType(numberType),
        string: new StringSerializer(),
        object: fromType(instanceofType(Object)),
        booleanArray: fromItemType(booleanType),
        numberArray: fromItemType(numberType),
        stringArray: fromItemType(stringType),
        objectArray: fromItemType(instanceofType(Object)),
        google: {
          sheets: fromType(GOOGLE_SHEETS_METADATA_TYPE),
        },
      },
      glob,
      {
        arrayOf: arrayOfType,
        boolean: booleanType,
        equal: equalType,
        hasProperties: hasPropertiesType,
        intersect: intersectType,
        iterableOf: iterableOfType,
        mapOf: mapOfType,
        null: nullType,
        number: numberType,
        object: instanceofType(Object),
        setOf: setOfType,
        string: stringType,
        undefined: undefinedType,
        union: unionType,
        unknown: unknownType,
      },
  );

  return rules;
}

function makeHiveRuleFn<A extends any[]>(
    fn: (...args: A) => Rule,
    ruleMap: Map<string, Rule>,
): (...args: A) => void {
  return (...args) => {
    const rule = fn(...args);
    ruleMap.set(rule.name, rule);
  };
}
