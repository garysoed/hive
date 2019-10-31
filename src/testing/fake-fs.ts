import * as fs from 'fs';

import { fake, spy, SpyObj } from '@gs-testing';
import { MapSubject, scanMap, scanSet, SetSubject } from '@gs-tools/rxjs';
import { Observable, Subject } from '@rxjs';
import { map, take } from '@rxjs/operators';

interface FakeFile {
  content: string;
}

const dirs$ = new SetSubject<fs.PathLike>();
let files$ = new MapSubject<fs.PathLike, FakeFile>();

type AccessHandler = (err: NodeJS.ErrnoException|null) => void;
function mockAccess(path: fs.PathLike, callback: AccessHandler): void;
function mockAccess(
    path: fs.PathLike,
    mode: number|undefined,
    callback: AccessHandler,
): void;
function mockAccess(
    path: fs.PathLike,
    modeOrCallback: number|AccessHandler|undefined,
    callback?: AccessHandler): void {
  const normalizedCallback = callback || (modeOrCallback as AccessHandler);
  files$
      .pipe(
          scanMap(),
          take(1),
      )
      .subscribe(map => {
        if (map.get(path)) {
          normalizedCallback(null);
          return;
        }

        normalizedCallback(new Error(`File ${path} not found`));
      });
}

type MkDirHandler = (err: NodeJS.ErrnoException|null) => void;
function mockMkDir(
    path: fs.PathLike,
    options: number|string|fs.MakeDirectoryOptions|undefined|null,
    callback: MkDirHandler,
): void;
function mockMkDir(
    path: fs.PathLike,
    callback: MkDirHandler,
): void;
function mockMkDir(
    path: fs.PathLike,
    optionsOrCallback: number|string|fs.MakeDirectoryOptions|undefined|null|MkDirHandler,
    callback?: MkDirHandler,
): void {
  dirs$.add(path);
  const normalizedCallback = callback || (optionsOrCallback as MkDirHandler);
  normalizedCallback(null);
}

type ReadFileHandler = (err: NodeJS.ErrnoException|null, data: Buffer) => void;
function mockReadFile(
    path: fs.PathLike|number,
    options: {}|undefined|null,
    callback: ReadFileHandler,
): void;
function mockReadFile(
    path: fs.PathLike|number,
    callback: ReadFileHandler,
): void;
function mockReadFile(
    path: fs.PathLike|number,
    optionsOrCallback: ReadFileHandler|{}|undefined|null,
    callback?: ReadFileHandler,
): void {
  if (typeof path === 'number') {
    throw new Error('File descriptor not supported');
  }

  const normalizedCallback = callback || (optionsOrCallback as ReadFileHandler);
  files$
      .pipe(
          scanMap(),
          take(1),
      )
      .subscribe(map => {
        const file = map.get(path);
        if (file) {
          normalizedCallback(null, file.content as any);
          return;
        }

        normalizedCallback(new Error(`File ${path} not found`), null as any);
      });
}

const watch$Map: Map<fs.PathLike, Subject<void>> = new Map();
function mockWatch(
    path: fs.PathLike,
    handler?: (event: string, filename: string) => any,
): SpyObj<fs.FSWatcher> {
  const subject = getWatcherSubject(path);
  const subscription = subject.subscribe(() => {
    if (handler) {
      handler('', path.toString());
    }
  });

  const watcher = Object.assign(
    {}, {
    close(): void {
      subscription.unsubscribe();
    },
  });
  return watcher as any;
}

export function getWatcherSubject(path: fs.PathLike): Subject<void> {
  const subject = watch$Map.get(path);
  if (subject) {
    return subject;
  }

  const newSubject = new Subject<void>();
  watch$Map.set(path, newSubject);
  return newSubject;
}

type WriteFileHandler = (err: NodeJS.ErrnoException | null) => void;
function mockWriteFile(
    path: fs.PathLike|number,
    data: any,
    options: fs.WriteFileOptions,
    callback: WriteFileHandler,
): void;
function mockWriteFile(
    path: fs.PathLike|number,
    data: any,
    callback: WriteFileHandler,
): void;
function mockWriteFile(
    path: fs.PathLike|number,
    data: any,
    optionsOrCallback: fs.WriteFileOptions|WriteFileHandler,
    callback?: WriteFileHandler,
): void {
  if (typeof path === 'number') {
    throw new Error('File descriptor not supported');
  }

  const normalizedCallback = callback || (optionsOrCallback as WriteFileHandler);
  files$.set(path, {content: data});
  normalizedCallback(null);
}


export function addFile(path: fs.PathLike, file: FakeFile): void {
  files$.set(path, file);
}

export function deleteFile(path: fs.PathLike): void {
  files$.delete(path);
}

export function getFile(path: fs.PathLike): Observable<FakeFile|null> {
  return files$.pipe(scanMap(), map(fileMap => fileMap.get(path) || null));
}

export function hasDir(path: fs.PathLike): Observable<boolean> {
  return dirs$.pipe(scanSet(), map(dirSet => dirSet.has(path)));
}

export function mockFs(): void {
  files$.complete();
  files$ = new MapSubject<fs.PathLike, FakeFile>();
  fake(spy(fs, 'access')).always().call(mockAccess);

  watch$Map.clear();
  fake(spy(fs, 'watch')).always().call(mockWatch);
  fake(spy(fs, 'readFile')).always().call(mockReadFile);
  fake(spy(fs, 'writeFile')).always().call(mockWriteFile);

  fake(spy(fs, 'mkdir')).always().call(mockMkDir);
}
