import { ConfigFile } from '../core/config-file';
import { Rule } from '../core/rule';

import { declare } from './operator/declare';
import { glob } from './operator/glob';
import { load } from './operator/load';
import { render } from './operator/render';


type HiveFnOf<F> = F extends (...args: infer A) => unknown ? (...args: A) => void : never;

interface HiveGlobal {
  readonly declare: HiveFnOf<typeof declare>;
  readonly glob: typeof glob;
  readonly load: HiveFnOf<typeof load>;
  readonly render: HiveFnOf<typeof render>;
}

type FnContent = (global: HiveGlobal) => void;

export function parseConfig(content: string): ConfigFile {
  const fn: FnContent = Function('hive', content) as unknown as FnContent;
  const rules = new Map<string, Rule>();
  const hiveGlobal = {
    declare: makeHiveRuleFn(declare, rules),
    glob,
    load: makeHiveRuleFn(load, rules),
    render: makeHiveRuleFn(render, rules),
  };
  fn(hiveGlobal);

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
