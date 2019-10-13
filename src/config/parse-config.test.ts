import { assert, match, MatcherType, should, test } from '@gs-testing';

import { DeclareRule } from '../core/declare-rule';
import { FileRef } from '../core/file-ref';
import { Type } from '../core/type/type';

import { parseConfig } from './parse-config';
import { RootType } from '../core/root-type';
import { NUMBER_TYPE, BOOLEAN_TYPE, STRING_TYPE, OBJECT_TYPE } from '../core/type/const-type';

function matchInputs(expected: {[key: string]: Type}): MatcherType<{[key: string]: Type}> {
  const matcherSpec: {[key: string]: Type} = {};

  for (const key in expected) {
    if (!expected.hasOwnProperty(key)) {
      continue;
    }

    matcherSpec[key] = expected[key];
  }

  return match.anyObjectThat<{[key: string]: Type}>().haveProperties(matcherSpec);
}

function matchFileRef(expected: FileRef): MatcherType<FileRef> {
  return match.anyObjectThat<FileRef>().haveProperties(expected);
}

function matchDeclareRule(expected: DeclareRule): MatcherType<DeclareRule> {
  return match.anyObjectThat<DeclareRule>().haveProperties({
    name: expected.name,
    processor: matchFileRef(expected.processor),
    inputs: matchInputs(expected.inputs),
    output: expected.output,
  });
}

test('@hive/config/parse-config', () => {
  should(`parse declares correctly`, () => {
    const CONTENT = `
      ruleA:
          declare: !!hive/file /:path/to/scriptA
          inputs:
              paramA: !!hive/type number
              paramB: !!hive/type boolean
          output: !!hive/type string

      ruleB:
          declare: !!hive/file out:path/to/scriptB
          inputs:
              param: !!hive/type boolean
          output: !!hive/type object
    `;

    assert([...parseConfig(CONTENT).declarations]).to.haveExactElements([
      matchDeclareRule({
        name: 'ruleA',
        processor: {rootType: RootType.SYSTEM_ROOT, path: 'path/to/scriptA'},
        inputs: {
          paramA: NUMBER_TYPE,
          paramB: BOOLEAN_TYPE,
        },
        output: STRING_TYPE,
      }),
      matchDeclareRule({
        name: 'ruleB',
        processor: {rootType: RootType.OUT_DIR, path: 'path/to/scriptB'},
        inputs: {
          param: BOOLEAN_TYPE,
        },
        output: OBJECT_TYPE,
      }),
    ]);
  });

  should(`throw error if a rule is an invalid object`, () => {
    const CONTENT = `
      invalid-rule:
          a: b
    `;

    assert(() => {
      parseConfig(CONTENT);
    }).to.throwErrorWithMessage(/is an invalid rule/);
  });

  should(`throw error if a rule is not an object`, () => {
    const CONTENT = `
      invalid-rule: 123
    `;

    assert(() => {
      parseConfig(CONTENT);
    }).to.throwErrorWithMessage(/is an invalid rule/);
  });
});
