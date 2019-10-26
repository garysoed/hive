import * as commandLineUsage from 'command-line-usage';

export interface CliSummary {
  summary: string;
  synopsis: string;
  title: string;
  body(): commandLineUsage.Section;
}

export function printSummary(summary: CliSummary): string {
  return commandLineUsage([
    {
      header: summary.title,
      content: summary.summary,
    },
    {
      header: 'Synopsis',
      content: summary.synopsis,
    },
    summary.body(),
  ]);
}
