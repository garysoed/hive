import {hasPropertiesType, mapOfType, stringType, Type} from 'gs-types';

import {RENDER_INPUT_TYPE, RenderInput} from '../core/render-input';


export interface ProjectConfig {
  readonly globals: ReadonlyMap<string, RenderInput>;
  readonly outdir: string;
  readonly roots: ReadonlyMap<string, string>;
}

export const PROJECT_CONFIG_TYPE: Type<ProjectConfig> = hasPropertiesType({
  globals: mapOfType(stringType, RENDER_INPUT_TYPE),
  outdir: stringType,
  roots: mapOfType(stringType, stringType),
});
