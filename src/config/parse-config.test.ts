
import { anyThat, arrayThat, assert, MatcherType, objectThat, setThat, should, test } from '@gs-testing';
import { numberType } from '@gs-types';

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
import { BUILT_IN_PROCESSOR_TYPE } from '../processor/built-in-processor-id';

import { parseConfig } from './parse-config';
import { fromType, Serializer } from './serializer/serializer';


type RuleWithoutType<R extends Rule> = {[K in Exclude<keyof R, 'type'>]: R[K]};
type RuleWithoutTypeOrInputs<R extends Rule> = {[K in Exclude<keyof R, 'type'|'inputs'>]: R[K]};

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
    output: expected.output,
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
        output: as.number,
      });

      load({
        name: 'ruleB',
        srcs: [
          '@out/path/out.txt',
        ],
        output: as.stringArray,
      });
    `;

    assert(parseConfig(CONTENT)).to.haveExactElements(new Map([
      [
        'ruleA',
        matchLoadRule({
          name: 'ruleA',
          srcs: [{rootType: BuiltInRootType.OUT_DIR, globPattern: 'glob/path/*.txt'}],
          output: anyThat<Serializer<number>>().passPredicate(
              loader => loader.desc === 'number',
              'a number loader',
          ),
        }),
      ],
      [
        'ruleB',
        matchLoadRule({
          name: 'ruleB',
          srcs: [{rootType: BuiltInRootType.OUT_DIR, path: 'path/out.txt'}],
          output: anyThat<Serializer<string[]>>().passPredicate(
              loader => loader.desc === 'string[]',
              'a string[] loader',
          ),
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
