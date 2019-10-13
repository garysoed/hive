import { ast, cst, Tag } from 'yaml';

export interface HiveYamlTag<T> {
  readonly tag: string;

  identify(obj: unknown): boolean;

  resolve(doc: ast.Document, cstNode: cst.Node): T;

  stringify(item: T): string;
}

export function castAsTag<T>(hiveTag: HiveYamlTag<T>): Tag {
  return {...hiveTag} as any;
}
