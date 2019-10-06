import * as yaml from 'yaml';

import { ProjectConfig } from './project-config';

interface ProjectConfigRaw {
  outdir?: string;
}

export function parseProject(content: string): ProjectConfig {
  const yamlRaw = yaml.parse(content);

  if (!(yaml instanceof Object)) {
    throw new Error('Not an object');
  }

  const config = createConfig(yamlRaw);
  if (!config) {
    throw new Error('Invalid project config file');
  }

  return config;
}

function createConfig(obj: ProjectConfigRaw): ProjectConfig|null {
  if (typeof obj.outdir !== 'string') {
    return null;
  }

  return {outdir: obj.outdir};
}
