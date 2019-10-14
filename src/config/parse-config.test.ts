import { FilePattern } from 'src/core/file-pattern';
import { RenderRule } from 'src/core/render-rule';

import { assert, match, MatcherType, should, test } from '@gs-testing';

import { DeclareRule } from '../core/declare-rule';
import { FileRef } from '../core/file-ref';
import { RenderInput } from '../core/render-input';
import { RootType } from '../core/root-type';
import { RuleRef } from '../core/rule-ref';
import { OBJECT_TYPE, STRING_TYPE } from '../core/type/const-type';
import { InputType } from '../core/type/input-type';

import { parseConfig } from './parse-config';


interface InputTypes {
  [key: string]: InputType;
}

function matchInputs(expected: InputTypes): MatcherType<InputTypes> {
  const matcherSpec: InputTypes = {};

  for (const key in expected) {
    if (!expected.hasOwnProperty(key)) {
      continue;
    }

    const expectedType = expected[key];
    matcherSpec[key] = match.anyObjectThat<InputType>().haveProperties({
      matcher: match.anyObjectThat<RegExp>().haveProperties({
        source: expectedType.matcher.source,
        flags: expectedType.matcher.flags,
      }),
    });
  }

  return match.anyObjectThat<InputTypes>().haveProperties(matcherSpec);
}

function matchRenderInputs(
    expected: {[key: string]: RenderInput},
): MatcherType<{[key: string]: RenderInput}> {
  const matcherSpec: {[key: string]: RenderInput} = {};

  for (const key in expected) {
    if (!expected.hasOwnProperty(key)) {
      continue;
    }

    matcherSpec[key] = expected[key];
  }

  return match.anyObjectThat<{[key: string]: RenderInput}>().haveProperties(matcherSpec);
}

function matchFileRef(expected: FileRef): MatcherType<FileRef> {
  return match.anyObjectThat<FileRef>().haveProperties(expected);
}

function matchRuleRef(expected: RuleRef): MatcherType<RuleRef> {
  return match.anyObjectThat<RuleRef>().haveProperties(expected);
}

function matchFilePattern(expected: FilePattern): MatcherType<FilePattern> {
  return match.anyObjectThat<FilePattern>().haveProperties({
    pattern: expected.pattern,
    rootType: expected.rootType,
    substitutionKeys: match.anySetThat().haveExactElements(expected.substitutionKeys),
  });
}

function matchDeclareRule(expected: DeclareRule): MatcherType<DeclareRule> {
  return match.anyObjectThat<DeclareRule>().haveProperties({
    name: expected.name,
    processor: matchFileRef(expected.processor),
    inputs: matchInputs(expected.inputs),
    output: expected.output,
  });
}

function matchRenderRule(expected: RenderRule): MatcherType<RenderRule> {
  return match.anyObjectThat<RenderRule>().haveProperties({
    name: expected.name,
    processor: matchRuleRef(expected.processor),
    inputs: matchRenderInputs(expected.inputs),
    output: matchFilePattern(expected.output),
  });
}

test('@hive/config/parse-config', () => {
  should(`parse declares correctly`, () => {
    const CONTENT = `
      ruleA:
          declare: !!hive/file /:path/to/scriptA
          inputs:
              paramA: !!hive/i_type number
              paramB: !!hive/i_type boolean
          output: !!hive/type string

      ruleB:
          declare: !!hive/file out:path/to/scriptB
          inputs:
              param: !!hive/i_type boolean
          output: !!hive/type object
    `;

    assert([...parseConfig(CONTENT).declarations]).to.haveExactElements([
      matchDeclareRule({
        name: 'ruleA',
        processor: {rootType: RootType.SYSTEM_ROOT, path: 'path/to/scriptA'},
        inputs: {
          paramA: {matcher: /number/},
          paramB: {matcher: /boolean/},
        },
        output: STRING_TYPE,
      }),
      matchDeclareRule({
        name: 'ruleB',
        processor: {rootType: RootType.OUT_DIR, path: 'path/to/scriptB'},
        inputs: {
          param: {matcher: /boolean/},
        },
        output: OBJECT_TYPE,
      }),
    ]);
  });

  should(`parse renders correctly`, () => {
    const CONTENT = `
      ruleA:
          render: !!hive/pattern out:path/{paramA}_{paramB}.txt
          inputs:
              paramA: [1, 2, 3]
              paramB: "stringValue"
          processor: !!hive/rule root:path:processor

      ruleB:
          render: !!hive/pattern out:path/out.txt
          inputs:
              param: false
          processor: !!hive/rule root:path:processor2
    `;

    assert([...parseConfig(CONTENT).renders]).to.haveExactElements([
      matchRenderRule({
        name: 'ruleA',
        output: {
          rootType: RootType.OUT_DIR,
          pattern: 'path/{paramA}_{paramB}.txt',
          substitutionKeys: new Set(['paramA', 'paramB']),
        },
        inputs: {
          paramA: match.anyArrayThat().haveExactElements([1, 2, 3]),
          paramB: 'stringValue',
        },
        processor: {rootType: RootType.PROJECT_ROOT, path: 'path', ruleName: 'processor'},
      }),
      matchRenderRule({
        name: 'ruleB',
        output: {
          rootType: RootType.OUT_DIR,
          pattern: 'path/out.txt',
          substitutionKeys: new Set(),
        },
        inputs: {
          param: false,
        },
        processor: {rootType: RootType.PROJECT_ROOT, path: 'path', ruleName: 'processor2'},
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
