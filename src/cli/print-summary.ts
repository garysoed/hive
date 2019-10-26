import * as commandLineUsage from 'command-line-usage';

export interface CliSummary {
  summary: string;
  synopsis: string;
  body(): commandLineUsage.Section;
}

export function printSummary(summary: CliSummary): string {
  return commandLineUsage([
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
}
