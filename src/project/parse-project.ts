import * as yaml from 'yaml';

import { ProjectConfig } from './project-config';

type ProjectConfigRaw = {[K in keyof ProjectConfig]: unknown};

export function parseProject(content: string): ProjectConfig {
  const yamlRaw = yaml.parse(content);

  if (!(yaml instanceof Object)) {
    throw new Error('Not an object');
  }

  const config = parseConfig(yamlRaw);
  if (!config) {
    throw new Error('Invalid project config file');
  }

  return config;
}

function parseConfig(obj: ProjectConfigRaw): ProjectConfig|null {
  if (typeof obj.outdir !== 'string') {
    return null;
  }

  if (!!obj.globals && typeof obj.globals !== 'object') {
    return null;
  }

  return {outdir: obj.outdir, globals: (obj.globals || {}) as {[key: string]: any}};
}
