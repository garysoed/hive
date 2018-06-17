import { assert, should } from 'gs-testing/export/main';
import { Mocks } from 'gs-testing/export/mock';
import { ImmutableMap } from 'gs-tools/export/collect';
import { Item } from './item';
import { ItemCollection } from './item-collection';
import { UpdateApi } from './update-api';
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

describe('ItemCollection', () => {
  let mockQueueMutatorFn: jasmine.Spy;
  let mockUpdateApi: jasmine.SpyObj<UpdateApi<TestItem, {}>>;
  let collection: ItemCollection<TestItem, {}>;

  beforeEach(() => {
    mockQueueMutatorFn = jasmine.createSpy('QueueMutatorFn');
    mockUpdateApi = jasmine.createSpyObj('UpdateApi', ['add', 'delete', 'filter', 'get', 'update']);
    collection = new ItemCollection(
        new VersionedSnapshotMap(ImmutableMap.of()),
        mockQueueMutatorFn,
        mockUpdateApi);
  });

  describe('add', () => {
    should(`queue local mutator correctly`, async () => {
      const item = new TestItem('addedItem');

      await collection.add(item);

      const currentData = new VersionedSnapshotMap(ImmutableMap.of());
      const newData = mockQueueMutatorFn.calls.argsFor(0)[0](currentData);
      assert(newData.get(item.getId())).to.be(item);
    });

    should(`queue remote mutator correctly`, async () => {
      const item = new TestItem('addedItem');

      await collection.add(item);

      mockQueueMutatorFn.calls.argsFor(0)[1]();

      // tslint:disable-next-line:no-floating-promises
      assert(mockUpdateApi.add).to.haveBeenCalledWith(item);
    });
  });

  describe('delete', () => {
    should(`queue local mutator correctly`, async () => {
      const item = new TestItem('deletedItem');

      await collection.delete(item.getId());

      const currentData = (new VersionedSnapshotMap(ImmutableMap.of()))
          .setUnversioned(item.getId(), item);
      const newData = mockQueueMutatorFn.calls.argsFor(0)[0](currentData);
      assert(newData.get(item.getId())).to.beNull();
    });

    should(`queue remote mutator correctly`, async () => {
      const item = new TestItem('deletedItem');

      await collection.delete(item.getId());

      mockQueueMutatorFn.calls.argsFor(0)[1]();

      // tslint:disable-next-line:no-floating-promises
      assert(mockUpdateApi.delete).to.haveBeenCalledWith(item.getId());
    });
  });

  describe('get', () => {
    should(`return the correct item`, () => {
      const item = new TestItem('item');
      const data = (new VersionedSnapshotMap<TestItem>(ImmutableMap.of()))
          .setUnversioned(item.getId(), item);
      collection = new ItemCollection(data, mockQueueMutatorFn, mockUpdateApi);

      assert(collection.get(item.getId())).to.be(item);
    });
  });

  describe('list', () => {
    should(`return all the items in the cache`, () => {
      const item1 = new TestItem('item1');
      const item2 = new TestItem('item2');
      const item3 = new TestItem('item3');
      const data = (new VersionedSnapshotMap<TestItem>(ImmutableMap.of()))
          .setUnversioned(item1.getId(), item1)
          .setUnversioned(item2.getId(), item2)
          .setUnversioned(item3.getId(), item3);
      collection = new ItemCollection(data, mockQueueMutatorFn, mockUpdateApi);

      assert(collection.list()).to.haveElements([item1, item2, item3]);
    });
  });

  describe('update', () => {
    should(`queue local mutator correctly`, async () => {
      const id = 'id';
      const updatedItem = new TestItem('updatedItem');
      const localMutator = () => updatedItem;
      const remoteMutator = async () => undefined;
      await collection.update(id, {localMutator, remoteMutator});

      const currentData = (new VersionedSnapshotMap(ImmutableMap.of()))
          .setUnversioned(id, new TestItem('oldItem'));
      const newData = mockQueueMutatorFn.calls.argsFor(0)[0](currentData);
      assert(newData.get(id)).to.be(updatedItem);
    });

    should(`queue local mutator that throws error if the ID does not exist`, async () => {
      const localMutator = () => new TestItem('updatedItem');
      const remoteMutator = async () => undefined;
      await collection.update('id', {localMutator, remoteMutator});

      const currentData = (new VersionedSnapshotMap(ImmutableMap.of()));
      assert(() => {
        mockQueueMutatorFn.calls.argsFor(0)[0](currentData);
      }).to.throwError(/cannot be found/);
    });

    should(`queue remote mutator correctly`, async () => {
      const id = 'id';
      const localMutator = () => new TestItem('updatedItem');
      const updateRequest = Mocks.object('UpdateRequest');
      const mockRemoteMutator = jasmine.createSpy('RemoteMutator');
      mockRemoteMutator.and.returnValue(updateRequest);
      await collection.update(id, {localMutator, remoteMutator: mockRemoteMutator});

      const oldItem = new TestItem('oldItem');
      const currentData = (new VersionedSnapshotMap(ImmutableMap.of()))
          .setUnversioned(id, oldItem);
      mockQueueMutatorFn.calls.argsFor(0)[1](currentData);

      // tslint:disable-next-line:no-floating-promises
      assert(mockUpdateApi.update).to.haveBeenCalledWith(updateRequest);
      assert(mockRemoteMutator).to.haveBeenCalledWith(oldItem);
    });

    should(`queue remote mutator that throws error if the ID does not exist`, async () => {
      const id = 'id';
      const localMutator = () => new TestItem('updatedItem');
      const mockRemoteMutator = jasmine.createSpy('RemoteMutator');
      await collection.update(id, {localMutator, remoteMutator: mockRemoteMutator});

      const currentData = new VersionedSnapshotMap(ImmutableMap.of());
      assert(() => {
        mockQueueMutatorFn.calls.argsFor(0)[1](currentData);
      }).to.throwError(/cannot be found/);
    });
  });
});
