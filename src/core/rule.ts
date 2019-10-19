import { DeclareRule } from './declare-rule';
import { LoadRule } from './load-rule';
import { RenderRule } from './render-rule';

export type Rule = DeclareRule|LoadRule|RenderRule;
