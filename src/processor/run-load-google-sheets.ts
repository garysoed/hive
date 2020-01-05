import { ConsoleDestination, ON_LOG_$ } from '@santa';

import { loadGoogleSheets } from './load-google-sheets';


const consoleLog = new ConsoleDestination();
ON_LOG_$.subscribe(entry => {
  consoleLog.log(entry);
});

loadGoogleSheets(
    {doc_id: '1VeQrzTz2ibWrN8bRQ1mJbck8vLY7U_ZMtir3lAHDHe0'},
    ['_vars!A1:A1'],
    '425591565764-len818a3riq4c3bii38hpai3s5o7aqd5.apps.googleusercontent.com',
    'C2-d4uXufbi8uk54jJGIeDUT',
    )
    .subscribe(result => console.log(JSON.stringify(result)));
