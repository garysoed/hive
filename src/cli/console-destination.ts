import { formatMessage, MessageType } from '@gs-tools/cli';
import { Destination, Entry, LogLevel } from '@santa';

export class ConsoleDestination implements Destination {
  log(entry: Entry): void {
    // tslint:disable-next-line:no-console
    console.log(getFormattedMessage(entry));
  }
}

function getFormattedMessage(entry: Entry): string {
  switch (entry.level) {
    case LogLevel.ERROR:
      return formatMessage(MessageType.FAILURE, getErrorMessage(entry.value));
    case LogLevel.DEBUG:
      return formatMessage(MessageType.DEBUG, `${entry.value}`);
    case LogLevel.INFO:
      return formatMessage(MessageType.INFO, `${entry.value}`);
    case LogLevel.LOG:
      return formatMessage(MessageType.PROGRESS, `${entry.value}`);
    case LogLevel.WARNING:
      return formatMessage(MessageType.WARNING, `${entry.value}`);
  }
}

function getErrorMessage(value: unknown): string {
  return value instanceof Error ? value.stack || value.message : `${value}`;
}
