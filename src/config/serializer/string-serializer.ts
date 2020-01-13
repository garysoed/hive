import { identity } from '@nabu';

import { Serializer } from './serializer';

export class StringSerializer extends Serializer<string> {
  constructor() {
    super(
        identity(),
        'string',
    );
  }
}
