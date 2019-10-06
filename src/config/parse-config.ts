import * as yaml from 'yaml';

import { ConfigFile } from '../core/config-file';
import { DeclarationRule } from '../core/declaration-rule';
import { RenderRule } from '../core/render-rule';

interface DeclarationRaw {
  declare?: string;
  inputs?: {[key: string]: string};
  output?: string;
}

export function parseConfig(content: string): ConfigFile {
  const yamlRaw = yaml.parse(content);

  if (!(yaml instanceof Object)) {
    throw new Error('Not an object');
  }

  const declarations = new Set<DeclarationRule>();
  const renders = new Set<RenderRule>();
  for (const key in yamlRaw) {
    if (!yamlRaw.hasOwnProperty(key)) {
      continue;
    }

    const entry = yamlRaw[key];
    const declaration = parseDeclaration(entry);
    const render = parseRender(entry);
    if (declaration) {
      declarations.add(declaration);
    } else if (render) {
      renders.add(render);
    } else {
      throw new Error(`${key} is an invalid rule`);
    }
  }

  return {declarations, renders};
}

function parseDeclaration(obj: DeclarationRaw): DeclarationRule|null {
  return null;
}

function parseRender(obj: {}): RenderRule|null {
  return null;
}
