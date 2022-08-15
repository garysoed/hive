import * as commandLineUsage from 'command-line-usage';
import {EMPTY, Observable} from 'rxjs';
import {Logger} from 'santa';


const LOGGER = new Logger('@hive/cli/print-summary');

export interface CliSummary {
  readonly summary: string;
  readonly synopsis: string;
  body(): readonly commandLineUsage.Section[];
}

export function printSummary(summary: CliSummary): Observable<unknown> {
  const message = [
    {
      header: 'NAME',
      content: summary.summary,
    },
    {
      header: 'SYNOPSIS',
      content: summary.synopsis,
    },
    ...summary.body(),
  ];

  LOGGER.info(message);

  return EMPTY;
}
