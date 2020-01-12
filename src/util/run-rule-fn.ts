import { Observable } from '@rxjs';

import { DeclareRule } from '../core/declare-rule';
import { LoadRule } from '../core/load-rule';
import { Processor } from '../core/processor';
import { RenderRule } from '../core/render-rule';


export interface RunRuleFn {
  (renderRule: RenderRule): Observable<ReadonlyMap<string, unknown>>;
  (declareRule: DeclareRule): Observable<Processor>;
  (loadRule: LoadRule): Observable<string[]>;
}
