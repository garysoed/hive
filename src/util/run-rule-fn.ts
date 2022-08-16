import {Vine} from 'grapevine';
import {Observable} from 'rxjs';

import {DeclareRule} from '../core/declare-rule';
import {LoadRule} from '../core/load-rule';
import {Processor} from '../core/processor';
import {RenderRule} from '../core/render-rule';


export interface RunRuleFn {
  (vine: Vine, renderRule: RenderRule, cwd: string): Observable<ReadonlyMap<string, unknown>>;
  (vine: Vine, declareRule: DeclareRule, cwd: string): Observable<Processor>;
  (vine: Vine, loadRule: LoadRule, cwd: string): Observable<string[]>;
}
