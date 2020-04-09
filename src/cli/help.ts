import * as commandLineArgs from 'command-line-args';
import { Observable } from 'rxjs';

import { CommandType } from './command-type';
import { printSummary } from './print-summary';
import { CLI as RENDER_CLI } from './render';

const COMMAND_OPTION = 'command';
const OPTIONS = [
  {
    name: COMMAND_OPTION,
    defaultOption: true,
  },
];

export const CLI = {
  title: 'Hive: Help',
  body: () => ([
    {
      header: 'COMMANDS',
      content: [
        {name: CommandType.HELP, summary: CLI.summary},
        {name: CommandType.RENDER, summary: RENDER_CLI.summary},
      ],
    },
  ]),
  summary: 'Display help on commands',
  synopsis: `$ {bold hive} {underline ${CommandType.HELP}} <command>`,
};

export function help(argv: string[]): Observable<unknown> {
  const options = commandLineArgs(OPTIONS, {argv, stopAtFirstUnknown: true});
  switch (options[COMMAND_OPTION]) {
    // case CommandType.ANALYZE:
    //   return printSummary(ANALYZE_CLI);
    case CommandType.HELP:
      return printSummary(CLI);
    // case CommandType.INIT:
    //   return printSummary(INIT_CLI);
    case CommandType.RENDER:
      return printSummary(RENDER_CLI);
    default:
      return printSummary(CLI);
  }
}
