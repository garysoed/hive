import { ImmutableSet } from 'gs-tools/export/collect';
import { Item } from './item';
import { QueueMutatorFn } from './queue-mutator-fn';
import { UpdateApi } from './update-api';
import { UpdateMutators } from './update-mutators';
import { VersionedSnapshotMap } from './versioned-snapshot-map';

/**
 * Represents a collection of items.
 */
export class ItemCollection<I extends Item, UR> {
  constructor(
      private readonly data_: VersionedSnapshotMap<I>,
      private readonly queueMutatorFn_: QueueMutatorFn<I>,
      private readonly updateApi_: UpdateApi<I, UR>) { }

  async add(item: I): Promise<void> {
    return this.queueMutatorFn_(
        data => data.setUnversioned(item.getId(), item),
        async () => this.updateApi_.add(item));
  }

  async delete(id: string): Promise<void> {
    return this.queueMutatorFn_(
        data => data.setUnversioned(id, null),
        async () => this.updateApi_.delete(id));
  }

  get(id: string): I|null {
    return this.data_.get(id);
  }

  list(): ImmutableSet<I> {
    return this.data_.filter(() => true);
  }

  async update(id: string, {localMutator, remoteMutator}: UpdateMutators<I, UR>): Promise<void> {
    return this.queueMutatorFn_(
        data => {
          const item = data.get(id);
          if (!item) {
            throw new Error(`Item ${id} cannot be found`);
          }

          return data.setUnversioned(id, localMutator(item));
        },
        async data => {
          const item = data.get(id);
          if (!item) {
            throw new Error(`Item ${id} cannot be found`);
          }

          return this.updateApi_.update(remoteMutator(item));
        });
  }
}
