import { arrayOfType, hasPropertiesType, instanceofType, stringType, Type, unionType } from '@gs-types';

import { GLOB_REF_TYPE, GlobRef } from '../../core/glob-ref';
import { LoadRule } from '../../core/load-rule';
import { ResolvedRenderInput } from '../../core/render-input';
import { RuleType } from '../../core/rule-type';
import { parseFileRef } from '../parse/parse-file-ref';
import { Serializer } from '../serializer/serializer';


interface Args {
  readonly name: string;
  readonly output: Serializer<ResolvedRenderInput>;
  readonly srcs: Array<string|GlobRef>;
}

const ARGS_TYPE: Type<Args> = hasPropertiesType({
  name: stringType,
  output: instanceofType<Serializer<ResolvedRenderInput>>(Serializer),
  srcs: arrayOfType(unionType([stringType, GLOB_REF_TYPE])),
});

export function load(args: unknown): LoadRule {
  ARGS_TYPE.assert(args);

  const srcs = args.srcs.map(src => {
    if (typeof src === 'string') {
      return parseFileRef(src);
    }

    return src;
  });

  return {name: args.name, output: args.output, srcs, type: RuleType.LOAD};
}
