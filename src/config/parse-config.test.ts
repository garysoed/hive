
import { arrayThat, assert, mapThat, MatcherType, objectThat, setThat, should, test } from '@gs-testing';

import { DeclareRule } from '../core/declare-rule';
import { FilePattern } from '../core/file-pattern';
import { FileRef } from '../core/file-ref';
import { LoadRule } from '../core/load-rule';
import { RenderInput } from '../core/render-input';
import { RenderRule } from '../core/render-rule';
import { RootType } from '../core/root-type';
import { Rule } from '../core/rule';
import { RuleRef } from '../core/rule-ref';
import { RuleType } from '../core/rule-type';
import { ConstType } from '../core/type/const-type';
import { InputType } from '../core/type/input-type';

import { parseConfig } from './parse-config';


type RuleWithoutType<R extends Rule> = {[K in Exclude<keyof R, 'type'>]: R[K]};

type InputTypes = ReadonlyMap<string, InputType>;
function matchInputs(expected: InputTypes): MatcherType<Map<string, InputType>> {
  const matcherSpec = new Map<string, InputType>();

  for (const [key, value] of expected) {
    const matcherValue = objectThat<InputType>().haveProperties({
      matcher: objectThat<RegExp>().haveProperties({
        source: value.matcher.source,
        flags: value.matcher.flags,
      }),
    });
    matcherSpec.set(key, matcherValue);
  }

  return mapThat<string, InputType>().haveExactElements(matcherSpec);
}

function matchRenderInputs(
    expected: ReadonlyMap<string, RenderInput>,
): MatcherType<Map<string, RenderInput>> {
  return mapThat<string, RenderInput>().haveExactElements(expected);
}

function matchRuleRef(expected: RuleRef): MatcherType<RuleRef> {
  return objectThat<RuleRef>().haveProperties(expected);
}

function matchFilePattern(expected: FilePattern): MatcherType<FilePattern> {
  return objectThat<FilePattern>().haveProperties({
    pattern: expected.pattern,
    rootType: expected.rootType,
    substitutionKeys: setThat().haveExactElements(expected.substitutionKeys),
  });
}

function matchDeclareRule(expected: RuleWithoutType<DeclareRule>): MatcherType<DeclareRule> {
  return objectThat<DeclareRule>().haveProperties({
    name: expected.name,
    processor: objectThat<FileRef>().haveProperties(expected.processor),
    inputs: matchInputs(expected.inputs),
    output: objectThat().haveProperties(expected.output),
    type: RuleType.DECLARE,
  });
}

function matchLoadRule(expected: RuleWithoutType<LoadRule>): MatcherType<LoadRule> {
  return objectThat<LoadRule>().haveProperties({
    name: expected.name,
    srcs: objectThat().haveProperties(expected.srcs),
    outputType: objectThat().haveProperties(expected.outputType),
    type: RuleType.LOAD,
  });
}

function matchRenderRule(expected: RuleWithoutType<RenderRule>): MatcherType<RenderRule> {
  return objectThat<RenderRule>().haveProperties({
    name: expected.name,
    processor: matchRuleRef(expected.processor),
    inputs: matchRenderInputs(expected.inputs),
    output: matchFilePattern(expected.output),
    type: RuleType.RENDER,
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
          output: {baseType: ConstType.STRING, isArray: false},
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
          output: {baseType: ConstType.OBJECT, isArray: true},
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
          outputType: {baseType: ConstType.NUMBER, isArray: false},
        }),
      ],
      [
        'ruleB',
        matchLoadRule({
          name: 'ruleB',
          srcs: {rootType: RootType.OUT_DIR, path: 'path/out.txt'},
          outputType: {baseType: ConstType.STRING, isArray: true},
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
            ['paramA', arrayThat().haveExactElements([1, 2, 3])],
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
