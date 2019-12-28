import { $, $recordToMap } from '@gs-tools/collect';
import { HasPropertiesType, InstanceofType, StringType, Type, UndefinedType, UnionType } from '@gs-types';

import { PROJECT_CONFIG_TYPE, ProjectConfig } from './project-config';


interface ProjectConfigJson {
  readonly globals?: {};
  readonly outdir: string;
  readonly roots?: {};
}

const PROJECT_CONFIG_JSON_TYPE: Type<ProjectConfigJson> = HasPropertiesType({
  globals: UnionType([InstanceofType(Object), UndefinedType]),
  outdir: StringType,
  roots: UnionType([InstanceofType(Object), UndefinedType]),
});

export function parseProject(content: string): ProjectConfig {
  const json = JSON.parse(content);

  PROJECT_CONFIG_JSON_TYPE.assert(json);
  const globals = $(json.globals || {}, $recordToMap());
  const roots = $(json.roots || {}, $recordToMap());

  const config = {globals, outdir: json.outdir, roots};
  PROJECT_CONFIG_TYPE.assert(config);

  return config;
}
