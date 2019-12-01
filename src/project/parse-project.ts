import * as yaml from 'yaml';

import { ProjectConfig } from './project-config';

type ProjectConfigRaw = {readonly [K in keyof ProjectConfig]: unknown};

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

  const globals = new Map<string, unknown>();
  const globalsRaw = obj.globals as {[key: string]: string} || {};
  for (const key of Object.keys(globalsRaw)) {
    globals.set(key, globalsRaw[key]);
  }

  return {outdir: obj.outdir, globals};
}
