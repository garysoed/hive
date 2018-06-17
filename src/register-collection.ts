import { staticSourceId, StaticSourceId, StaticStreamId, staticStreamId } from 'grapevine/export/component';
import { $vine, VineBuilder, VineImpl } from 'grapevine/export/main';
import { ImmutableList, ImmutableMap, ImmutableSet } from 'gs-tools/export/collect';
import { AnyType, InstanceofType } from 'gs-types/export';
import { Item } from './item';
import { ItemCollection } from './item-collection';
import { LocalMutator } from './local-mutator';
import { RemoteMutator } from './remote-mutator';
import { UpdateApi } from './update-api';
import { VersionedSnapshotMap } from './versioned-snapshot-map';

type FetchDataImpl<I> = () => Promise<{items: ImmutableSet<I>; version: number}>;

export function createCollection_<I extends Item, UR>(
    $localMutators: StaticSourceId<ImmutableList<LocalMutator<I>>>,
    baseData: VersionedSnapshotMap<I>,
    mutators: ImmutableList<LocalMutator<I>>,
    updateApi: UpdateApi<I, UR>,
    vine: VineImpl): ItemCollection<I, UR> {
  let data = baseData;
  for (const mutator of mutators) {
    data = mutator(data);
  }

  return new ItemCollection(
      data,
      async (localMutator, remoteMutator) => executeMutators_(
          $localMutators,
          data,
          localMutator,
          remoteMutator,
          vine),
      updateApi);
}

export async function executeMutators_<I extends Item>(
    $localMutators: StaticSourceId<ImmutableList<LocalMutator<I>>>,
    data: VersionedSnapshotMap<I>,
    mutator: LocalMutator<I>,
    remoteMutator: RemoteMutator<I>,
    vine: VineImpl): Promise<void> {
  const mutators = await vine.getLatest($localMutators);
  vine.setValue($localMutators, mutators.add(mutator));
  await remoteMutator(data);
  const newMutators = await vine.getLatest($localMutators);
  vine.setValue($localMutators, newMutators.delete(mutator));
}

export async function fetchData_<I extends Item>(
    $base: StaticSourceId<VersionedSnapshotMap<I>>,
    fetchDataImpl: FetchDataImpl<I>,
    vine: VineImpl): Promise<void> {
  const {items: newItems, version} = await fetchDataImpl();
  const latestBase = await vine.getLatest($base);

  const newBase = latestBase.setAll(
      newItems.mapItem(item => [item.getId(), item] as [string, I]),
      version);
  vine.setValue($base, newBase);
}

export function registerCollection<I extends Item, UR>(
    storageName: string,
    updateApi: UpdateApi<I, UR>,
    vineBuilder: VineBuilder): {id: StaticStreamId<ItemCollection<I, UR>>} {
  const $base = staticSourceId(
      `base-${storageName}`,
      InstanceofType<VersionedSnapshotMap<I>>(VersionedSnapshotMap));
  vineBuilder.source($base, new VersionedSnapshotMap(ImmutableMap.of()));

  const $localMutators = staticSourceId(
      `localMutators-${storageName}`,
      InstanceofType<ImmutableList<LocalMutator<I>>>(ImmutableList));
  vineBuilder.source($localMutators, ImmutableList.of());

  const id = staticStreamId(storageName, AnyType<ItemCollection<I, UR>>());
  vineBuilder.stream(
      id,
      (baseData, mutators, vine) => createCollection_(
          $localMutators,
          baseData,
          mutators,
          updateApi,
          vine),
      $base,
      $localMutators,
      $vine);

  return {id};
}
