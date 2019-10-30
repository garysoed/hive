import { formatMessage } from '@gs-tools/cli';
import { Destination, Entry, LogLevel } from '@santa';

export class ConsoleDestination implements Destination {
  log(entry: Entry): void {
    // tslint:disable-next-line:no-console
    console.log(getFormattedMessage(entry));
  }
}

function getFormattedMessage(entry: Entry): string {
  if (entry.level === LogLevel.ERROR) {
    return formatMessage(entry.level, getErrorMessage(entry.value));
  }

  return formatMessage(entry.level, `${entry.value}`);
}

function getErrorMessage(value: unknown): string {
  return value instanceof Error ? value.stack || value.message : `${value}`;
}
