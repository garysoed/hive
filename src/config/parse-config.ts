import { arrayOfType, booleanType, equalType, hasPropertiesType, instanceofType, intersectType, iterableOfType, mapOfType, nullType, numberType, setOfType, stringType, undefinedType, unionType, unknownType } from '@gs-types';

import { ConfigFile } from '../core/config-file';
import { Rule } from '../core/rule';

import { declare } from './operator/declare';
import { glob } from './operator/glob';
import { load } from './operator/load';
import { render } from './operator/render';


export function parseConfig(content: string): ConfigFile {
  const fn = Function('declare', 'load', 'render', 'glob', 'type', content);
  const rules = new Map<string, Rule>();
  fn(
      makeHiveRuleFn(declare, rules),
      makeHiveRuleFn(load, rules),
      makeHiveRuleFn(render, rules),
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
