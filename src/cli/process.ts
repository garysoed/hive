import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import {Vine} from 'grapevine';
import {Type, arrayOfType, enumType, hasPropertiesType, stringType} from 'gs-types';
import {firstValueFrom} from 'rxjs';

import {BuiltInProcessorId} from '../processor/built-in-processor-id';
import {ProcessorId} from '../processor/processor';
import {PROCESSORS} from '../processor/processors';
import {readFile} from '../util/read-file';
import {writeFile} from '../util/write-file';

import {CommandType} from './command-type';


interface GenericProcessorSpec {
  readonly type: ProcessorId;
  readonly config: {};
}
const GENERIC_PROCESSOR_SPEC_TYPE = hasPropertiesType<GenericProcessorSpec>({
  type: enumType(BuiltInProcessorId),
  config: hasPropertiesType({}),
});

interface Config {
  readonly inputPath: string;
  readonly outputPath: string;
  readonly processors: readonly GenericProcessorSpec[];
}
const CONFIG_TYPE: Type<Config> = hasPropertiesType({
  inputPath: stringType,
  outputPath: stringType,
  processors: arrayOfType(GENERIC_PROCESSOR_SPEC_TYPE),
});

const CONFIG_OPTION = 'config';
const OPTIONS = [
  {name: CONFIG_OPTION, alias: 'c', type: String},
];

export const CLI = {
  title: 'Hive: Process',
  body: (): readonly commandLineUsage.Section[] => ([
    {
      header: 'OPTIONS',
      content: [
        {
          name: 'config',
          description: 'Path to the configuration file for this processor',
        },
      ],
    },
  ]),
  summary: 'Runs the converter on the given input file',
  synopsis: `$ {bold hive} {underline ${CommandType.PROCESS}} <path_to_input_file> `
      + '--config=<config> --output=<output> [--processor_type=<processor_type>]',
};

export async function process(vine: Vine, argv: readonly string[]): Promise<void> {
  const options = commandLineArgs(OPTIONS, {argv: [...argv], stopAtFirstUnknown: true});
  const configPath = options[CONFIG_OPTION];
  stringType.assert(configPath);

  const config = JSON.parse(await firstValueFrom(readFile(vine, configPath)));
  CONFIG_TYPE.assert(config);

  const input = await firstValueFrom(readFile(vine, config.inputPath));
  let outStr = input;
  for (const processor of config.processors) {
    const processorConfig = processor.config;
    const processorFn = PROCESSORS.get(processor.type);
    if (!processorFn) {
      throw new Error(`Processor ${processor.type} is unsupported`);
    }

    outStr = await processorFn(vine, outStr, processorConfig);
  }

  await firstValueFrom(writeFile(vine, config.outputPath, outStr));
}
