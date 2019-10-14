import { DeclareRule } from './declare-rule';
import { RenderRule } from './render-rule';

export interface ConfigFile {
  declarations: ReadonlySet<DeclareRule>;
  renders: ReadonlySet<RenderRule>;
}
