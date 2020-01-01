import commandLineArgs from 'command-line-args';

import { EMPTY, Observable, Subject } from '@rxjs';
import { catchError, takeUntil } from '@rxjs/operators';
import { ConsoleDestination, Logger, ON_LOG_$ } from '@santa';

import { CommandType } from './cli/command-type';
import { CLI as HELP_CLI, help } from './cli/help';
import { printSummary } from './cli/print-summary';
import { render } from './cli/render';


const LOGGER = new Logger('@hive/main');

const consoleLog = new ConsoleDestination({showKey: false});
ON_LOG_$.subscribe();

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
 * Completes whenever running is done.
 */
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

const onDone$ = new Subject();
ON_LOG_$
    .pipe(takeUntil(onDone$))
    .subscribe(entry => {
      consoleLog.log(entry);
    });

run()
    .pipe(
        catchError(e => {
          LOGGER.error(e);
          return EMPTY;
        }),
    )
    .subscribe({complete: () => {
      onDone$.next();
    }});
