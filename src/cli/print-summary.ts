import * as commandLineUsage from 'command-line-usage';

import { Observable, of as observableOf } from '@rxjs';
import { tap } from '@rxjs/operators';

import { LOGGER } from './logger';


export interface CliSummary {
  readonly summary: string;
  readonly synopsis: string;
  body(): readonly commandLineUsage.Section[];
}

export function printSummary(summary: CliSummary): Observable<unknown> {
  const message = commandLineUsage([
    {
      header: 'NAME',
      content: summary.summary,
    },
    {
      header: 'SYNOPSIS',
      content: summary.synopsis,
    },
    ...summary.body(),
  ]);

  return observableOf(message).pipe(
      tap(message => console.log(message)),
  );
}
