import { CommandType } from './command-type';

export const CLI = {
  title: 'Hive: Help',
  body: () => ({
    header: 'Commands',
    content: [
    ],
  }),
  summary: 'Display help on commands',
  synopsis: `$ hive ${CommandType.HELP} <command>`,
};
