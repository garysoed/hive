import {arrayOfType, Type} from 'gs-types';
import {compose, Converter, json, reverse, withTypeCheck} from 'nabu';

import {Serializer} from './serializer';


export class ArraySerializer<T> extends Serializer<readonly T[]> {
  readonly itemLoader: Serializer<T> = new Serializer(this.itemConverter, this.itemDesc);

  constructor(
      converter: Converter<readonly T[], string>,
      private readonly itemConverter: Converter<T, string>,
      desc: string,
      private readonly itemDesc: string,
  ) {
    super(converter, desc);
  }
}

export function fromItemType<T>(itemType: Type<T>): ArraySerializer<T> {
  const arrayType = arrayOfType(itemType);
  return new ArraySerializer(
      reverse(compose(
          reverse(json()),
          withTypeCheck(arrayType),
      )),
      reverse(compose(
          reverse(json()),
          withTypeCheck(itemType),
      )),
      arrayType.toString(),
      itemType.toString(),
  );
}

