import { formatMessage, MessageType } from '@gs-tools/cli';
import { Observable, of as observableOf } from '@rxjs';

import { CLI as HELP_CLI } from './cli/help';
import { printSummary } from './cli/print-summary';


const CLI = {
  body: HELP_CLI.body,
  title: 'Hive',
  summary: 'Manages a chain of rendering processes to render your documents.',
  synopsis: '$ hive {underline command} [command options]',
};

/**
 * Returns observable that emits messages to print
 */
function run(): Observable<string> {
  return observableOf(printSummary(CLI));
}

// tslint:disable: no-console
run().subscribe(
    results => console.log(results),
    (e: Error) => console.log(formatMessage(MessageType.FAILURE, e.stack || e.message)),
);
