import * as fs from 'fs';

import {source} from 'grapevine';
import {FsLike} from 'gs-testing/export/fake';

export const $fs = source<FsLike>(() => fs);