import { DeclarationRule } from './declaration-rule';
import { RenderRule } from './render-rule';

export interface ConfigFile {
  declarations: Set<DeclarationRule>;
  renders: Set<RenderRule>;
}
