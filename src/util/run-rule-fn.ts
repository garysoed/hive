import { Observable } from '@rxjs';

import { DeclareRule } from '../core/declare-rule';
import { LoadRule } from '../core/load-rule';
import { Processor } from '../core/processor';
import { RenderRule } from '../core/render-rule';


export interface RunRuleFn {
  (renderRule: RenderRule, cwd: string): Observable<ReadonlyMap<string, unknown>>;
  (declareRule: DeclareRule, cwd: string): Observable<Processor>;
  (loadRule: LoadRule, cwd: string): Observable<string[]>;
}
