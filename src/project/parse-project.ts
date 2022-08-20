import * as path from 'path';

import {$asMap, $map, $recordToMap} from 'gs-tools/export/collect';
import {$pipe} from 'gs-tools/export/typescript';
import {hasPropertiesType, instanceofType, stringType, Type} from 'gs-types';

import {ProjectConfig, PROJECT_CONFIG_TYPE} from './project-config';


interface ProjectConfigJson {
  readonly globals?: {};
  readonly outdir: string;
  readonly roots?: {};
}

const PROJECT_CONFIG_JSON_TYPE: Type<ProjectConfigJson> = hasPropertiesType(
    {
      outdir: stringType,
    },
    {
      globals: instanceofType(Object),
      roots: instanceofType(Object),
    });

export function parseProject(content: string, cwd: string): ProjectConfig {
  const json = JSON.parse(content);

  PROJECT_CONFIG_JSON_TYPE.assert(json);
  const globals = $pipe(json.globals || {}, $recordToMap());
  const roots = $pipe(json.roots || {}, $recordToMap());

  const config = {globals, outdir: json.outdir, roots};
  PROJECT_CONFIG_TYPE.assert(config);

  const resolvedRoots = $pipe(
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
