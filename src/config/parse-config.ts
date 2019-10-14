import * as yaml from 'yaml';

import { ConfigFile } from '../core/config-file';
import { DeclareRule } from '../core/declare-rule';
import { RenderRule } from '../core/render-rule';

import { FILE_REF_TAG } from './file-ref-tag';
import { parseDeclare } from './parse-declare';
import { parseRender } from './parse-render';
import { TYPE_TAG } from './type-tag';
import { FILE_PATTERN_TAG } from './file-pattern-tag';
import { RULE_REF_TAG } from './rule-ref-tag';

const CUSTOM_TAGS = [
  FILE_PATTERN_TAG,
  FILE_REF_TAG,
  RULE_REF_TAG,
  TYPE_TAG,
];

export function parseConfig(content: string): ConfigFile {
  const yamlRaw = yaml.parse(content, {tags: CUSTOM_TAGS});

  if (!(yaml instanceof Object)) {
    throw new Error('Not an object');
  }

  const declarations = new Set<DeclareRule>();
  const renders = new Set<RenderRule>();
  for (const key in yamlRaw) {
    if (!yamlRaw.hasOwnProperty(key)) {
      continue;
    }

    const entry = yamlRaw[key];
    if (typeof entry !== 'object') {
      throw new Error(`${key} is an invalid rule`);
    }

    const declaration = parseDeclare(key, entry);
    const render = parseRender(key, entry);
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
