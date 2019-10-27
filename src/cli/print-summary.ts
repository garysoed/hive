import * as commandLineUsage from 'command-line-usage';

import { debug } from '@gs-tools/rxjs';
import { Observable, of as observableOf } from '@rxjs';
import { tap } from '@rxjs/operators';

import { LOGGER } from './logger';

export interface CliSummary {
  summary: string;
  synopsis: string;
  body(): commandLineUsage.Section;
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
    summary.body(),
  ]);

  return observableOf(message).pipe(
      tap(message => LOGGER.info('', message)),
  );
}
