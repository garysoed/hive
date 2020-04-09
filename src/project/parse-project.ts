import { $, $asMap, $map, $recordToMap } from 'gs-tools/export/collect';
import { hasPropertiesType, instanceofType, stringType, Type, undefinedType, unionType } from 'gs-types';
import * as path from 'path';

import { PROJECT_CONFIG_TYPE, ProjectConfig } from './project-config';


interface ProjectConfigJson {
  readonly globals?: {};
  readonly outdir: string;
  readonly roots?: {};
}

const PROJECT_CONFIG_JSON_TYPE: Type<ProjectConfigJson> = hasPropertiesType({
  globals: unionType([instanceofType(Object), undefinedType]),
  outdir: stringType,
  roots: unionType([instanceofType(Object), undefinedType]),
});

export function parseProject(content: string, cwd: string): ProjectConfig {
  const json = JSON.parse(content);

  PROJECT_CONFIG_JSON_TYPE.assert(json);
  const globals = $(json.globals || {}, $recordToMap());
  const roots = $(json.roots || {}, $recordToMap());

  const config = {globals, outdir: json.outdir, roots};
  PROJECT_CONFIG_TYPE.assert(config);

  const resolvedRoots = $(
      config.roots,
      $map(([key, rootKey]) => {
        if (path.isAbsolute(rootKey)) {
          return [key, rootKey] as [string, string];
        }

        return [key, path.join(cwd, rootKey)] as [string, string];
      }),
      $asMap(),
  );

  return {...config, roots: resolvedRoots};
}
