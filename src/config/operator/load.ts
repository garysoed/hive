import { ArrayOfType, HasPropertiesType, StringType, Type, UnionType } from '@gs-types';

import { GLOB_REF_TYPE, GlobRef } from '../../core/glob-ref';
import { LoadRule } from '../../core/load-rule';
import { RuleType } from '../../core/rule-type';
import { parseFileRef } from '../parse/parse-file-ref';
import { parseOutputType } from '../parse/parse-output-type';


interface Args {
  readonly name: string;
  readonly output: string;
  readonly srcs: Array<string|GlobRef>;
}

const ARGS_TYPE: Type<Args> = HasPropertiesType({
  name: StringType,
  output: StringType,
  srcs: ArrayOfType(UnionType([StringType, GLOB_REF_TYPE])),
});

export function load(args: unknown): LoadRule {
  ARGS_TYPE.assert(args);

  const srcs = args.srcs.map(src => {
    if (typeof src === 'string') {
      return parseFileRef(src);
    }

    return src;
  });

  const output = parseOutputType(args.output);

  return {name: args.name, output, srcs, type: RuleType.LOAD};
}
