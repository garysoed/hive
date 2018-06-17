import { Item } from './item';
import { VersionedSnapshotMap } from './versioned-snapshot-map';

export type LocalMutator<I extends Item> =
    (data: VersionedSnapshotMap<I>) => VersionedSnapshotMap<I>;
