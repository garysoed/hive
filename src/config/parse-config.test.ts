
import { arrayThat, assert, mapThat, MatcherType, objectThat, setThat, should, test } from '@gs-testing';

import { DeclareRule } from '../core/declare-rule';
import { FilePattern } from '../core/file-pattern';
import { FileRef } from '../core/file-ref';
import { GlobRef } from '../core/glob-ref';
import { LoadRule } from '../core/load-rule';
import { RenderInput } from '../core/render-input';
import { RenderRule } from '../core/render-rule';
import { BuiltInRootType } from '../core/root-type';
import { Rule } from '../core/rule';
import { RuleRef } from '../core/rule-ref';
import { RuleType } from '../core/rule-type';
import { ConstType } from '../core/type/const-type';
import { InputType } from '../core/type/input-type';
import { BUILT_IN_PROCESSOR_TYPE } from '../processor/built-in-processor-id';

import { parseConfig } from './parse-config';


type RuleWithoutType<R extends Rule> = {[K in Exclude<keyof R, 'type'>]: R[K]};
type RuleWithoutTypeOrInputs<R extends Rule> = {[K in Exclude<keyof R, 'type'|'inputs'>]: R[K]};

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

function matchDeclareRule(
    expected: RuleWithoutTypeOrInputs<DeclareRule>,
): MatcherType<DeclareRule> {
  return objectThat<DeclareRule>().haveProperties({
    name: expected.name,
    processor: objectThat<FileRef>().haveProperties(expected.processor),
    type: RuleType.DECLARE,
  });
}

function matchLoadRule(expected: RuleWithoutType<LoadRule>): MatcherType<LoadRule> {
  const srcsMatch = expected.srcs.map(src => objectThat<FileRef|GlobRef>().haveProperties(src));
  return objectThat<LoadRule>().haveProperties({
    name: expected.name,
    srcs: arrayThat<FileRef|GlobRef>().haveExactElements(srcsMatch),
    output: objectThat().haveProperties(expected.output),
    type: RuleType.LOAD,
  });
}

function matchRenderRule(expected: RuleWithoutType<RenderRule>): MatcherType<RenderRule> {
  const processor = BUILT_IN_PROCESSOR_TYPE.check(expected.processor) ?
      expected.processor : matchRuleRef(expected.processor);
  return objectThat<RenderRule>().haveProperties({
    name: expected.name,
    processor,
    output: matchFilePattern(expected.output),
    type: RuleType.RENDER,
  });
}

test('@hive/config/parse-config', () => {
  should(`parse declares correctly`, () => {
    const CONTENT = `
      declare({
        name: 'ruleA',
        processor: '/path/to/scriptA',
        inputs: {
          paramA: type.number,
          paramB: type.boolean,
        },
        output: 'string',
      });

      declare({
        name: 'ruleB',
        processor: '@out/path/to/scriptB',
        inputs: {
          param: type.boolean,
        },
        output: 'object[]',
      });
    `;

    assert(parseConfig(CONTENT)).to.haveExactElements(new Map([
      [
        'ruleA',
        matchDeclareRule({
          name: 'ruleA',
          processor: {rootType: BuiltInRootType.SYSTEM_ROOT, path: 'path/to/scriptA'},
        }),
      ],
      [
        'ruleB',
        matchDeclareRule({
          name: 'ruleB',
          processor: {rootType: BuiltInRootType.OUT_DIR, path: 'path/to/scriptB'},
        }),
      ],
    ]));
  });

  should(`parse load rules correctly`, () => {
    const CONTENT = `
      load({
        name: 'ruleA',
        srcs: [
          glob('@out/glob/path/*.txt'),
        ],
        output: 'number',
      });

      load({
        name: 'ruleB',
        srcs: [
          '@out/path/out.txt',
        ],
        output: 'string[]',
      });
    `;

    assert(parseConfig(CONTENT)).to.haveExactElements(new Map([
      [
        'ruleA',
        matchLoadRule({
          name: 'ruleA',
          srcs: [{rootType: BuiltInRootType.OUT_DIR, globPattern: 'glob/path/*.txt'}],
          output: {baseType: ConstType.NUMBER, isArray: false},
        }),
      ],
      [
        'ruleB',
        matchLoadRule({
          name: 'ruleB',
          srcs: [{rootType: BuiltInRootType.OUT_DIR, path: 'path/out.txt'}],
          output: {baseType: ConstType.STRING, isArray: true},
        }),
      ],
    ]));
  });

  should(`parse renders correctly`, () => {
    const CONTENT = `
      render({
        name: 'ruleA',
        inputs: {
          paramA: [1, 2, 3],
          paramB: 'stringValue',
        },
        processor: '@root/path:processor',
        output: '@out/path/{paramA}_{paramB}.txt',
      });

      render({
        name: 'ruleB',
        inputs: {
          param: false,
        },
        processor: '@root/path:processor2',
        output: '@out/path/out.txt',
      });
    `;

    assert(parseConfig(CONTENT)).to.haveExactElements(new Map([
      [
        'ruleA',
        matchRenderRule({
          name: 'ruleA',
          output: {
            rootType: BuiltInRootType.OUT_DIR,
            pattern: 'path/{paramA}_{paramB}.txt',
            substitutionKeys: new Set(['paramA', 'paramB']),
          },
          inputs: new Map<string, RenderInput>([
            ['paramA', arrayThat().haveExactElements([1, 2, 3])],
            ['paramB', 'stringValue'],
          ]),
          processor: {rootType: BuiltInRootType.PROJECT_ROOT, path: 'path', ruleName: 'processor'},
        }),
      ],
      [
        'ruleB',
        matchRenderRule({
          name: 'ruleB',
          output: {
            rootType: BuiltInRootType.OUT_DIR,
            pattern: 'path/out.txt',
            substitutionKeys: new Set(),
          },
          inputs: new Map([
            ['param', false],
          ]),
          processor: {rootType: BuiltInRootType.PROJECT_ROOT, path: 'path', ruleName: 'processor2'},
        }),
      ],
    ]));
  });
});
