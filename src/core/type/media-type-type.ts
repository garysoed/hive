import { EqualType, HasPropertiesType, Type, ValidationResult } from '@gs-types';

import { MediaType } from './media-type';

export class MediaTypeType extends Type<MediaType> {
  private readonly hasPropertiesType = HasPropertiesType<MediaType>({
    type: EqualType(this.type),
    subtype: EqualType(this.subtype),
  });

  constructor(
      readonly type: string,
      readonly subtype: string,
  ) {
    super();
  }

  stringify(): string {
    return `${this.type}/${this.subtype}`;
  }

  toString(): string {
    return this.hasPropertiesType.toString();
  }

  validate(target: unknown): ValidationResult {
    return this.hasPropertiesType.validate(target);
  }
}
