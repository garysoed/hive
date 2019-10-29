import * as commandLineArgs from 'command-line-args';

import { EMPTY, Observable, throwError } from '@rxjs';
import { catchError } from '@rxjs/operators';
import { logDestination } from '@santa';

import { CommandType } from './cli/command-type';
import { ConsoleDestination } from './cli/console-destination';
import { CLI as HELP_CLI, help } from './cli/help';
import { LOGGER } from './cli/logger';
import { printSummary } from './cli/print-summary';
import { render } from './cli/render';


logDestination.set(new ConsoleDestination());

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

function run(): Observable<unknown> {
  switch (options[COMMAND_OPTION]) {
    // case CommandType.ANALYZE:
    //   return analyze(options._unknown || []);
    case CommandType.HELP:
      return help(options._unknown || []);
    // case CommandType.INIT:
    //   return init(options._unknown || []);
    case CommandType.RENDER:
      return render(options._unknown || []);
    default:
      return printSummary(CLI);
  }
}

// tslint:disable:no-console
run()
    .pipe(
        catchError(e => {
          LOGGER.error(e);
          return EMPTY;
        }),
    )
    .subscribe();
