import * as commandLineUsage from 'command-line-usage';
import {EMPTY, Observable} from 'rxjs';


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

  // eslint-disable-next-line no-console
  console.log(commandLineUsage.default(message));

  return EMPTY;
}
