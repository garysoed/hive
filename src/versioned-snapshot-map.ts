import { ImmutableList, ImmutableMap, ImmutableSet } from 'gs-tools/export/collect';
import { Item } from './item';

/**
 * Map that keeps track of its values by their version.
 */
export class VersionedSnapshotMap<I extends Item> implements Iterable<[string, I]> {
  constructor(
      private readonly data_: ImmutableMap<string, {item: I; version: number}>) { }

  [Symbol.iterator](): Iterator<[string, I]> {
    return this.data_.map(({item}) => item)[Symbol.iterator]();
  }

  filter(filterFn: (item: I, id: string) => boolean): ImmutableSet<I> {
    return this.data_
        .filter(({item}, id) => filterFn(item, id))
        .map(({item}) => item)
        .values();
  }

  get(id: string): I|null {
    const data = this.data_.get(id);
    if (!data) {
      return null;
    }

    return data.item;
  }

  set(id: string, item: I|null, version: number): VersionedSnapshotMap<I> {
    return this.setAll(new Map<string, I|null>([[id, item]]), version);
  }

  setAll(items: Iterable<[string, I|null]>, version: number): VersionedSnapshotMap<I> {
    const toAdd: [string, {item: I; version: number}][] = [];
    const toDelete: string[] = [];
    for (const [id, item] of items) {
      const existingData = this.data_.get(id);
      if (!existingData) {
        if (item === null) {
          continue;
        }

        toAdd.push([id, {item, version}]);
        continue;
      }

      const existingVersion = existingData.version;
      if (existingVersion >= version) {
        continue;
      }

      if (item === null) {
        toDelete.push(id);
        continue;
      }

      toAdd.push([id, {item, version}]);
    }

    return new VersionedSnapshotMap(
        this.data_
            .deleteAllKeys(ImmutableSet.of(toDelete))
            .addAll(ImmutableList.of(toAdd)));
  }

  setUnversioned(id: string, item: I|null): VersionedSnapshotMap<I> {
    const existingData = this.data_.get(id);
    if (!existingData) {
      if (item === null) {
        return this;
      }

      return new VersionedSnapshotMap(this.data_.set(id, {item, version: 0}));
    }

    const existingVersion: number = existingData.version;
    if (item === null) {
      return new VersionedSnapshotMap(this.data_.deleteKey(id));
    }

    return new VersionedSnapshotMap(this.data_.set(id, {item, version: existingVersion + 1}));
  }
}
