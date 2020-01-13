import { arrayOfType, Type } from '@gs-types';
import { compose, Converter, json, reverse, withTypeCheck } from '@nabu';

import { Loader } from './loader';


export class ArrayLoader<T> extends Loader<T[]> {
  readonly itemLoader: Loader<T> = new Loader(this.itemConverter, this.itemDesc);

  constructor(
      converter: Converter<T[], string>,
      private readonly itemConverter: Converter<T, string>,
      desc: string,
      private readonly itemDesc: string,
  ) {
    super(converter, desc);
  }
}

export function fromItemType<T>(itemType: Type<T>): ArrayLoader<T> {
  const arrayType = arrayOfType(itemType);
  return new ArrayLoader(
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

