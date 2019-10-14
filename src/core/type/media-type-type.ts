import { EqualType, HasPropertiesType, Type } from '@gs-types';

import { MediaType } from './media-type';

export class MediaTypeType implements Type<MediaType> {
  private readonly hasPropertiesType = HasPropertiesType<MediaType>({
    type: EqualType(this.type),
    subtype: EqualType(this.subtype),
  });

  constructor(
      readonly type: string,
      readonly subtype: string,
  ) { }

  check(target: any): target is MediaType {
    return this.hasPropertiesType.check(target);
  }

  stringify(): string {
    return `${this.type}/${this.subtype}`;
  }

  toString(): string {
    return this.hasPropertiesType.toString();
  }
}
