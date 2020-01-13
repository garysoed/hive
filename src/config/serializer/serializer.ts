import { Type } from '@gs-types';
import { compose, Converter, json, reverse, withTypeCheck } from '@nabu';

export class Serializer<T> {
  constructor(
      private readonly converter: Converter<T, string>,
      readonly desc: string,
  ) { }

  load(target: string): T {
    const result = this.converter.convertBackward(target);
    if (!result.success) {
      throw new Error(`${target} is not of type ${this.desc}`);
    }

    return result.result;
  }
}

export function fromType<T>(type: Type<T>): Serializer<T> {
  return new Serializer(
      reverse(compose(
          reverse(json()),
          withTypeCheck(type),
      )),
      type.toString(),
  );
}

