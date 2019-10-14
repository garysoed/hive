import { DeclareRule } from './declare-rule';
import { RenderRule } from './render-rule';

export interface ConfigFile {
  readonly declarations: ReadonlySet<DeclareRule>;
  readonly renders: ReadonlySet<RenderRule>;
}
