import { Observable } from 'rxjs';

import { Rule } from './rule';

export interface RuleRef<R extends Rule> {
  readonly rule$: Observable<R>;
}
