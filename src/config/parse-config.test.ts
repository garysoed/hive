import { NumberType, StringType } from 'gs-types/export';

import { assert, match, MatcherType, should, test } from '@gs-testing';

import { DeclareRule } from '../core/declare-rule';
import { FilePattern } from '../core/file-pattern';
import { FileRef } from '../core/file-ref';
import { LoadRule } from '../core/load-rule';
import { RenderInput } from '../core/render-input';
import { RenderRule } from '../core/render-rule';
import { RootType } from '../core/root-type';
import { RuleRef } from '../core/rule-ref';
import { InputType } from '../core/type/input-type';

import { OBJECT_TYPE } from './output-type-tag';
import { parseConfig } from './parse-config';


type InputTypes = ReadonlyMap<string, InputType>;
function matchInputs(expected: InputTypes): MatcherType<Map<string, InputType>> {
  const matcherSpec = new Map<string, InputType>();

  for (const [key, value] of expected) {
    const matcherValue = match.anyObjectThat<InputType>().haveProperties({
      matcher: match.anyObjectThat<RegExp>().haveProperties({
        source: value.matcher.source,
        flags: value.matcher.flags,
      }),
    });
    matcherSpec.set(key, matcherValue);
  }

  return match.anyMapThat<string, InputType>().haveExactElements(matcherSpec);
}

function matchRenderInputs(
    expected: ReadonlyMap<string, RenderInput>,
): MatcherType<Map<string, RenderInput>> {
  return match.anyMapThat<string, RenderInput>().haveExactElements(expected);
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
    processor: match.anyObjectThat<FileRef>().haveProperties(expected.processor),
    inputs: matchInputs(expected.inputs),
    output: match.anyObjectThat().haveProperties(expected.output),
  });
}

function matchLoadRule(expected: LoadRule): MatcherType<LoadRule> {
  return match.anyObjectThat<LoadRule>().haveProperties({
    name: expected.name,
    srcs: match.anyObjectThat().haveProperties(expected.srcs),
    type: match.anyObjectThat().haveProperties(expected.type),
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
          output: !!hive/o_type string

      ruleB:
          declare: !!hive/file out:path/to/scriptB
          inputs:
              param: !!hive/i_type boolean
          output: !!hive/o_type object[]
    `;

    assert(parseConfig(CONTENT)).to.haveElements([
      [
        'ruleA',
        matchDeclareRule({
          name: 'ruleA',
          processor: {rootType: RootType.SYSTEM_ROOT, path: 'path/to/scriptA'},
          inputs: new Map([
            ['paramA', {isArray: false, matcher: /number/}],
            ['paramB', {isArray: false, matcher: /boolean/}],
          ]),
          output: {baseType: StringType, isArray: false},
        }),
      ],
      [
        'ruleB',
        matchDeclareRule({
          name: 'ruleB',
          processor: {rootType: RootType.OUT_DIR, path: 'path/to/scriptB'},
          inputs: new Map([
            ['param', {isArray: false, matcher: /boolean/}],
          ]),
          output: {baseType: OBJECT_TYPE, isArray: true},
        }),
      ],
    ]);
  });

  should(`parse load rules correctly`, () => {
    const CONTENT = `
      ruleA:
          load: !!hive/glob out:glob/path/*.txt
          as: !!hive/o_type number

      ruleB:
          load: !!hive/file out:path/out.txt
          as: !!hive/o_type string[]
    `;

    assert(parseConfig(CONTENT)).to.haveElements([
      [
        'ruleA',
        matchLoadRule({
          name: 'ruleA',
          srcs: {rootType: RootType.OUT_DIR, globPattern: 'glob/path/*.txt'},
          type: {baseType: NumberType, isArray: false},
        }),
      ],
      [
        'ruleB',
        matchLoadRule({
          name: 'ruleB',
          srcs: {rootType: RootType.OUT_DIR, path: 'path/out.txt'},
          type: {baseType: StringType, isArray: true},
        }),
      ],
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

    assert(parseConfig(CONTENT)).to.haveElements([
      [
        'ruleA',
        matchRenderRule({
          name: 'ruleA',
          output: {
            rootType: RootType.OUT_DIR,
            pattern: 'path/{paramA}_{paramB}.txt',
            substitutionKeys: new Set(['paramA', 'paramB']),
          },
          inputs: new Map<string, RenderInput>([
            ['paramA', match.anyArrayThat().haveExactElements([1, 2, 3])],
            ['paramB', 'stringValue'],
          ]),
          processor: {rootType: RootType.PROJECT_ROOT, path: 'path', ruleName: 'processor'},
        }),
      ],
      [
        'ruleB',
        matchRenderRule({
          name: 'ruleB',
          output: {
            rootType: RootType.OUT_DIR,
            pattern: 'path/out.txt',
            substitutionKeys: new Set(),
          },
          inputs: new Map([
            ['param', false],
          ]),
          processor: {rootType: RootType.PROJECT_ROOT, path: 'path', ruleName: 'processor2'},
        }),
      ],
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
