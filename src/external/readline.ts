import * as readline from 'readline';

import {source} from 'grapevine';
import {ReadlineLike} from 'gs-testing/export/fake';

export const $readline = source<ReadlineLike>(() => readline);