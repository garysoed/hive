import { HasPropertiesType, MapOfType, StringType, Type } from '@gs-types';

import { RENDER_INPUT_TYPE, RenderInput } from '../core/render-input';


export interface ProjectConfig {
  readonly globals: ReadonlyMap<string, RenderInput>;
  readonly outdir: string;
  readonly roots: ReadonlyMap<string, string>;
}

export const PROJECT_CONFIG_TYPE: Type<ProjectConfig> = HasPropertiesType({
  globals: MapOfType(StringType, RENDER_INPUT_TYPE),
  outdir: StringType,
  roots: MapOfType(StringType, StringType),
});
