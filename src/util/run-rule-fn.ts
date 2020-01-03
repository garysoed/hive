import { Observable } from '@rxjs';

import { DeclareFn } from '../core/declare-fn';
import { DeclareRule } from '../core/declare-rule';
import { LoadRule } from '../core/load-rule';
import { RenderRule } from '../core/render-rule';


export interface RunRuleFn {
  (renderRule: RenderRule): Observable<ReadonlyMap<string, string>>;
  (declareRule: DeclareRule): Observable<DeclareFn>;
  (loadRule: LoadRule): Observable<string[]>;
}
