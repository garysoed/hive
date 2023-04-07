import * as commandLineArgs from 'command-line-args';
import {Vine} from 'grapevine';
import {EMPTY, Observable, Subject} from 'rxjs';
import {catchError, takeUntil} from 'rxjs/operators';
import {Logger, ON_LOG_$} from 'santa';
import {CliDestination} from 'santa/export/cli';

import {analyze} from './cli/analyze';
import {CommandType} from './cli/command-type';
import {CLI as HELP_CLI, help} from './cli/help';
import {printSummary} from './cli/print-summary';
import {run as runRule} from './cli/run';


const LOGGER = new Logger('@hive/main');

const COMMAND_OPTION = 'command';
const OPTIONS = [
  {
    name: COMMAND_OPTION,
    defaultOption: true,
  },
];
const CLI = {
  body: HELP_CLI.body,
  summary: '{bold hive} - Manages a chain of rendering processes to render your documents.',
  synopsis: '$ {bold hive} {underline command} [command options]',
};

const options = commandLineArgs.default(OPTIONS, {stopAtFirstUnknown: true});

/**
 * Completes whenever running is done.
 */
function run(): Observable<unknown> {
  const vine = new Vine({appName: 'hive-cli'});
  switch (options[COMMAND_OPTION]) {
    case CommandType.ANALYZE:
      return analyze(vine, options._unknown || []);
    case CommandType.HELP:
      return help(options._unknown || []);
    // case CommandType.INIT:
    //   return init(options._unknown || []);
    case CommandType.RUN:
      return runRule(vine, options._unknown || []);
    default:
      return printSummary(CLI);
  }
}

const onDone$ = new Subject();
const consoleLog = new CliDestination(
    entry => {
      if (entry.key === 'authurl') {
        return {showKey: false, enableFormat: false};
      }
      return {showKey: false};
    },
);
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
      onDone$.next({});
    }});
