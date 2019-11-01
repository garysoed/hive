import { logDestination } from '@santa';

import { ConsoleDestination } from '../cli/console-destination';

import { GoogleOauth } from './google-oauth';
import { loadGoogleSheets } from './load-google-sheets';


logDestination.set(new ConsoleDestination());

loadGoogleSheets(
    {doc_id: '1VeQrzTz2ibWrN8bRQ1mJbck8vLY7U_ZMtir3lAHDHe0'},
    ['_vars!A1:A1'],
    new GoogleOauth(
        '425591565764-len818a3riq4c3bii38hpai3s5o7aqd5.apps.googleusercontent.com',
        'C2-d4uXufbi8uk54jJGIeDUT',
    ))
    .subscribe(result => console.log(JSON.stringify(result)));
