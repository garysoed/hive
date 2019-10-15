import { DeclareRule } from './declare-rule';
import { LoadRule } from './load-rule';
import { RenderRule } from './render-rule';

export interface ConfigFile {
  readonly declarations: ReadonlySet<DeclareRule>;
  readonly loads: ReadonlySet<LoadRule>;
  readonly renders: ReadonlySet<RenderRule>;
}
