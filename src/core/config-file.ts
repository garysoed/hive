import { DeclareRule } from './declare-rule';
import { RenderRule } from './render-rule';

export interface ConfigFile {
  declarations: Set<DeclareRule>;
  renders: Set<RenderRule>;
}
