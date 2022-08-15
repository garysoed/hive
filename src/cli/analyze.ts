import * as commandLineArgs from 'command-line-args';
import {$asArray, $asMap, $join, $map} from 'gs-tools/export/collect';
import {$pipe} from 'gs-tools/export/typescript';
import {Type} from 'gs-types';
import {combineLatest, Observable, throwError} from 'rxjs';
import {map, switchMap, take, tap} from 'rxjs/operators';
import {Logger} from 'santa';

import {parseRuleRef} from '../config/parse/parse-rule-ref';
import {Serializer} from '../config/serializer/serializer';
import {FilePattern} from '../core/file-pattern';
import {FILE_REF_TYPE, FileRef} from '../core/file-ref';
import {GlobRef} from '../core/glob-ref';
import {RenderInput} from '../core/render-input';
import {BuiltInRootType, RootType} from '../core/root-type';
import {Rule} from '../core/rule';
import {RULE_REF_TYPE, RuleRef} from '../core/rule-ref';
import {RuleType} from '../core/rule-type';
import {BUILT_IN_PROCESSOR_TYPE as BUILT_IN_PROCESSOR_ID, BuiltInProcessorId} from '../processor/built-in-processor-id';
import {findRoot} from '../project/find-root';
import {loadProjectConfig} from '../project/load-project-config';
import {ProjectConfig} from '../project/project-config';
import {readRule} from '../util/read-rule';

import {CommandType} from './command-type';


const LOGGER = new Logger('@hive/cli/analyze');

const ALL_OPTIONS = 'all';
const OPTIONS = [
  {
    name: ALL_OPTIONS,
    defaultOption: true,
    multiple: true,
  },
];

interface ProjectDetails {
  readonly config: ProjectConfig;
  readonly path: string;
}

export const CLI = {
  title: 'Hive: Analyze',
  body: (): {} => ({
  }),
  summary: 'Analyzes a rule or a project',
  synopsis: `$ hive ${CommandType.ANALYZE} <type> [<path_to_rule>]`,
};

export function analyze(argv: string[]): Observable<unknown> {
  const options = commandLineArgs.default(OPTIONS, {argv, stopAtFirstUnknown: true});
  const [type, rulePath] = options[ALL_OPTIONS];
  switch (type) {
    case 'project':
      return getProjectDetails().pipe(
          map(details => printProjectDetails(details)),
          tap(message => LOGGER.info(message)),
      );
    case 'rule':
      return combineLatest([getProjectDetails(), getRuleDetails(rulePath)]).pipe(
          map(([project, rule]) => [
            ['=== PROJECT ==='],
            ...printProjectDetails(project),
            [''],
            ['=== RULE ==='],
            ...printRuleDetails(rule),
            [''],
            [''],
          ]),
          tap(message => LOGGER.info(message)),
      );
  }

  return throwError(`Analyze is not supported for type ${type}`);
}

function getProjectDetails(): Observable<ProjectDetails> {
  return findRoot().pipe(
      take(1),
      switchMap(path => {
        if (!path) {
          return throwError(new Error('No project roots found'));
        }

        return loadProjectConfig().pipe(map(config => ({path, config})));
      }),
  );
}

function getRuleDetails(ruleRaw: string): Observable<Rule> {
  return readRule(parseRuleRef(ruleRaw), process.cwd()).pipe(map(({rule}) => rule));
}

function printProjectDetails({path, config}: ProjectDetails): ReadonlyArray<readonly string[]> {
  const roots = stringifyMap(config.roots, ' -> ');
  const globals = stringifyMap(
      $pipe(
          config.globals,
          $map(([key, value]) => [key, `${value}`] as [string, string]),
          $asMap(),
      ),
      ': ',
  );

  return [
    ['Root', path],
    ['@out', config.outdir],
    ['Root dirs', roots],
    ['Globals', globals],
  ];
}

function printRuleDetails(rule: Rule): ReadonlyArray<readonly string[]> {
  const lines: string[][] = [
    ['Name', rule.name],
    ['Type', stringifyRuleType(rule.type)],
  ];

  switch (rule.type) {
    case RuleType.DECLARE: {
      const inputs: ReadonlyMap<string, string> = $pipe(
          rule.inputs,
          $map(([key, value]) => [key, stringifyInputType(value)] as [string, string]),
          $asMap(),
      );
      lines.push(['Processor', stringifyFileRef(rule.processor)]);
      lines.push(['Inputs', stringifyMap(inputs, ': ')]);
      break;
    }
    case RuleType.LOAD: {
      const sources = $pipe(
          rule.srcs,
          $map(src => {
            if (FILE_REF_TYPE.check(src)) {
              return stringifyFileRef(src);
            }

            return stringifyGlobRef(src);
          }),
          $asArray(),
          $join('\n'),
      );
      lines.push(['Sources', sources]);
      lines.push(['Output', stringifyLoader(rule.output)]);
      break;
    }
    case RuleType.RENDER: {
      const inputs: ReadonlyMap<string, string> = $pipe(
          rule.inputs,
          $map(([key, value]) => [key, `${stringifyRenderInput(value)}`] as [string, string]),
          $asMap(),
      );
      lines.push(['Processor', stringifyProcessor(rule.processor)]);
      lines.push(['Inputs', stringifyMap(inputs, ': ')]);
      lines.push(['Output', stringifyFilePattern(rule.output)]);
    }
  }
  return lines;
}

function stringifyFilePattern(filePattern: FilePattern): string {
  return `${stringifyRootType(filePattern.rootType)}${filePattern.pattern}`;
}

function stringifyFileRef(fileRef: FileRef): string {
  return `${stringifyRootType(fileRef.rootType)}${fileRef.path}`;
}

function stringifyGlobRef(globRef: GlobRef): string {
  return `glob(${stringifyRootType(globRef.rootType)}${globRef.globPattern})`;
}

function stringifyInputType(type: Type<unknown>): string {
  return `${type}`;
}

function stringifyMap(map: ReadonlyMap<string, string>, separator: string): string {
  return $pipe(
      map,
      $map(([key, value]) => `${key}${separator}${value}`),
      $asArray(),
      $join('\n'),
  );
}

function stringifyLoader(loader: Serializer<unknown>): string {
  return loader.desc;
}

function stringifyProcessor(processor: RuleRef|BuiltInProcessorId): string {
  if (BUILT_IN_PROCESSOR_ID.check(processor)) {
    return processor;
  }

  return stringifyRuleRef(processor);
}

function stringifyRenderInput(input: RenderInput): string {
  if (RULE_REF_TYPE.check(input)) {
    return stringifyRuleRef(input);
  }

  return `${input}`;
}

function stringifyRootType(rootType: RootType): string {
  if (typeof rootType === 'string') {
    return `@${rootType}`;
  }

  switch (rootType) {
    case BuiltInRootType.CURRENT_DIR:
      return '';
    case BuiltInRootType.OUT_DIR:
      return '@out/';
    case BuiltInRootType.PROJECT_ROOT:
      return '@root/';
    case BuiltInRootType.SYSTEM_ROOT:
      return '/';
  }
}

function stringifyRuleRef(ruleRef: RuleRef): string {
  return `${stringifyFileRef(ruleRef)}:${ruleRef.ruleName}`;
}

function stringifyRuleType(ruleType: RuleType): string {
  switch (ruleType) {
    case RuleType.DECLARE:
      return 'DECLARE';
    case RuleType.LOAD:
      return 'LOAD';
    case RuleType.RENDER:
      return 'RENDER';
  }
}
