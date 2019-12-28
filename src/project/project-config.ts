import { HasPropertiesType, InstanceofType, MapOfType, StringType, Type, UnknownType } from '@gs-types';

export interface ProjectConfig {
  globals: ReadonlyMap<string, unknown>;
  outdir: string;
  roots: ReadonlyMap<string, string>;
}

export const PROJECT_CONFIG_TYPE: Type<ProjectConfig> = HasPropertiesType({
  globals: MapOfType(StringType, UnknownType),
  outdir: StringType,
  roots: MapOfType(StringType, StringType),
});
