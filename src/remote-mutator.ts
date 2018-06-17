import { Item } from './item';
import { VersionedSnapshotMap } from './versioned-snapshot-map';

export type RemoteMutator<I extends Item> = (data: VersionedSnapshotMap<I>) => Promise<any>;
