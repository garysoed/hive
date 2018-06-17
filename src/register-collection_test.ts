import { staticSourceId } from 'grapevine/export/component';
import { getOrRegisterApp as getOrRegisterVineApp } from 'grapevine/export/main';
import { assert, should, wait, waitForAsync } from 'gs-testing/export/main';
import { Mocks } from 'gs-testing/export/mock';
import { ImmutableList, ImmutableMap } from 'gs-tools/export/collect';
import { AnyType } from 'gs-types/export';
import { Item } from './item';
import { ItemCollection } from './item-collection';
import { LocalMutator } from './local-mutator';
import { createCollection_, registerCollection } from './register-collection';
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

describe('registerCollection', () => {
  describe('createCollection_', () => {
    const $localMutators = staticSourceId(
        'localMutators',
        AnyType<ImmutableList<LocalMutator<TestItem>>>());
    let mockUpdateApi: jasmine.SpyObj<UpdateApi<TestItem, {}>>;

    beforeEach(() => {
      mockUpdateApi = jasmine.createSpyObj('UpdateApi', ['add']);
    });

    should(`apply the local mutators correctly`, () => {
      const newItemId = 'newItemId';
      const newItem = new TestItem(newItemId);
      const localMutators = ImmutableList.of<LocalMutator<TestItem>>([
        data => data.setUnversioned(newItemId, newItem),
      ]);

      const collection = createCollection_<TestItem, {}>(
          $localMutators,
          new VersionedSnapshotMap(ImmutableMap.of()),
          localMutators,
          mockUpdateApi,
          Mocks.object('vine'));
      assert(collection.get(newItemId)).to.be(newItem);
    });

    should(`execute enqueued mutators correctly`, async () => {
      const existingItemId = 'existingItemId';
      const existingItem = new TestItem(existingItemId);

      const newItemId = 'newItemId';
      const newItem = new TestItem(newItemId);

      const localMutator: LocalMutator<TestItem> =
          data => data.setUnversioned(existingItemId, existingItem);

      const {builder} = getOrRegisterVineApp('test');
      builder.source($localMutators, ImmutableList.of([localMutator]));

      const localMutators = ImmutableList.of<LocalMutator<TestItem>>();
      const vine = builder.run();
      const collection = createCollection_(
          $localMutators,
          new VersionedSnapshotMap(ImmutableMap.of()),
          localMutators,
          mockUpdateApi,
          vine);
      await collection.add(newItem);

      await wait(mockUpdateApi.add).to.haveBeenCalledWith(newItem);
      await waitForAsync(async () => {
        const mutators = await vine.getLatest($localMutators);

        return mutators.size();
      }).to.resolveWith(1);
    });
  });

  describe('registerCollection', () => {
    should(`register the IDs correctly`, async () => {
      const {builder: vineBuilder} = getOrRegisterVineApp('test');
      const updateApi = Mocks.object<UpdateApi<TestItem, {}>>('updateApi');
      const {id} = registerCollection('test', updateApi, vineBuilder);

      assert(await vineBuilder.run().getLatest(id)).to.beAnInstanceOf(ItemCollection);
    });
  });
});
