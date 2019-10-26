import chalk from 'chalk';
import * as commandLineArgs from 'command-line-args';

import { formatMessage, MessageType } from '@gs-tools/cli';
import { Observable, of as observableOf } from '@rxjs';

import { CommandType } from './cli/command-type';
import { CLI as HELP_CLI, help } from './cli/help';
import { printSummary } from './cli/print-summary';

const COMMAND_OPTION = 'command';
const OPTIONS = [
  {
    name: COMMAND_OPTION,
    defaultOption: true,
  },
];
const CLI = {
  body: HELP_CLI.body,
  summary: `{bold hive} - Manages a chain of rendering processes to render your documents.`,
  synopsis: `$ {bold hive} {underline command} [command options]`,
};

const options = commandLineArgs(OPTIONS, {stopAtFirstUnknown: true});

/**
 * Returns observable that emits messages to print
 */
function run(): Observable<string> {
  switch (options[COMMAND_OPTION]) {
    // case CommandType.ANALYZE:
    //   return analyze(options._unknown || []);
    case CommandType.HELP:
      return observableOf(help(options._unknown || []));
    // case CommandType.INIT:
    //   return init(options._unknown || []);
    default:
      return observableOf(printSummary(CLI));
  }
}

// tslint:disable: no-console
run().subscribe(
    results => console.log(results),
    (e: Error) => console.log(formatMessage(MessageType.FAILURE, e.stack || e.message)),
);
