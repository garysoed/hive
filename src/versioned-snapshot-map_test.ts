import { assert, should } from 'gs-testing/export/main';
import { ImmutableMap } from 'gs-tools/export/collect';
import { Item } from './item';
import { VersionedSnapshotMap } from './versioned-snapshot-map';

/**
 * @test
 */
class TestItem implements Item {
  constructor(private readonly id_: string) { }

  getId(): string {
    return this.id_;
  }
}

describe('VersionedSnapshotMap', () => {
  describe('filter', () => {
    should(`return the correct map`, () => {
      const item1 = new TestItem('id1');
      const item2 = new TestItem('id2');
      const item3 = new TestItem('id3');
      const map = new VersionedSnapshotMap(
          ImmutableMap.of([
            [item1.getId(), {item: item1, version: 1}],
            [item2.getId(), {item: item2, version: 2}],
            [item3.getId(), {item: item3, version: 3}],
          ]));

      assert(map.filter(item => item !== item2)).to.haveElements([item1, item3]);
    });
  });

  describe('get', () => {
    should(`return the correct item`, () => {
      const id2 = 'id2';
      const item1 = new TestItem('id1');
      const item2 = new TestItem(id2);
      const item3 = new TestItem('id3');
      const map = new VersionedSnapshotMap(
          ImmutableMap.of([
            [item1.getId(), {item: item1, version: 1}],
            [item2.getId(), {item: item2, version: 2}],
            [item3.getId(), {item: item3, version: 3}],
          ]));

      assert(map.get(id2)).to.be(item2);
    });

    should(`return null if the item does not exist`, () => {
      const map = new VersionedSnapshotMap(ImmutableMap.of());

      assert(map.get('id')).to.beNull();
    });
  });

  describe('set', () => {
    should(`return the correct map`, () => {
      const map = new VersionedSnapshotMap(ImmutableMap.of());

      const newId = 'newId';
      const newItem = new TestItem(newId);
      const newMap = map.set(newId, newItem, 12);

      assert(newMap).to.haveElements([[newId, newItem]]);
    });
  });

  describe('setAll', () => {
    should(`return the correct map`, () => {
      const map = new VersionedSnapshotMap(ImmutableMap.of());

      const newId1 = 'newId1';
      const newItem1 = new TestItem(newId1);
      const newId2 = 'newId2';
      const newItem2 = new TestItem(newId2);
      const newId3 = 'newId3';
      const newItem3 = new TestItem(newId3);
      const newMap = map.setAll(
          new Map([
            [newId1, newItem1],
            [newId2, newItem2],
            [newId3, newItem3],
          ]), 123);

      assert(newMap).to.haveElements([[newId1, newItem1], [newId2, newItem2], [newId3, newItem3]]);
    });

    should(`delete the value if it is null`, () => {
      const id = 'id';
      const item = new TestItem(id);
      const map = new VersionedSnapshotMap(ImmutableMap.of([[id, {item, version: 0}]]));
      const newMap = map.setAll(new Map([[id, null]]), 123);

      assert(newMap).to.haveElements([]);
    });

    should(`do nothing if the set version is older`, () => {
      const id = 'id';
      const oldItem = new TestItem(id);
      const map = new VersionedSnapshotMap(ImmutableMap.of([[id, {item: oldItem, version: 12}]]));
      const newMap = map.setAll(new Map([[id, null]]), 0);

      assert(newMap).to.haveElements([[id, oldItem]]);
    });

    should(`return the correct map if the old item exists`, () => {
      const id = 'id';
      const oldItem = new TestItem(id);
      const newItem = new TestItem('newId');
      const map = new VersionedSnapshotMap(ImmutableMap.of([[id, {item: oldItem, version: 12}]]));
      const newMap = map.setAll(new Map([[id, newItem]]), 123);

      assert(newMap).to.haveElements([[id, newItem]]);
    });

    should(`return the correct map if the old item does not exist and value is null`, () => {
      const map = new VersionedSnapshotMap(ImmutableMap.of());
      const newMap = map.setAll(new Map([['id', null]]), 0);

      assert(newMap).to.haveElements([]);
    });
  });

  describe('setUnversioned', () => {
    should(`return the correct map`, () => {
      const map = new VersionedSnapshotMap(ImmutableMap.of());

      const newId = 'newId';
      const newItem = new TestItem(newId);
      const newMap = map.setUnversioned(newId, newItem);

      assert(newMap).to.haveElements([[newId, newItem]]);
    });

    should(`override old value`, () => {
      const id = 'id';
      const oldItem = new TestItem(id);
      const newItem = new TestItem('newId');
      const map = new VersionedSnapshotMap(ImmutableMap.of([[id, {item: oldItem, version: 12}]]));
      const newMap = map.setUnversioned(id, newItem);

      assert(newMap).to.haveElements([[id, newItem]]);
    });

    should(`delete the value if it is null`, () => {
      const id = 'id';
      const item = new TestItem(id);
      const map = new VersionedSnapshotMap(ImmutableMap.of([[id, {item, version: 0}]]));
      const newMap = map.setUnversioned(id, null);

      assert(newMap).to.haveElements([]);
    });
  });
});
