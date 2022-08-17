import * as process from 'process';

import {source} from 'grapevine';
import {ProcessLike} from 'gs-testing/export/fake';

export const $process = source<ProcessLike>(() => process);