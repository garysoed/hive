import { identity } from '@nabu';

import { Loader } from './loader';

export class StringLoader extends Loader<string> {
  constructor() {
    super(
        identity(),
        'string',
    );
  }
}
