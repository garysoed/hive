import * as glob from 'glob';
import {source} from 'grapevine';
import {GlobLike} from 'gs-testing/export/fake';

export const $glob = source<GlobLike>(() => glob.default.bind(glob));