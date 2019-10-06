import { Observable } from '@rxjs';

export interface FileRef {
  readonly content$: Observable<string>;
}
