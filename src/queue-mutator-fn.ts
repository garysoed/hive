import { Item } from './item';
import { LocalMutator } from './local-mutator';
import { RemoteMutator } from './remote-mutator';

export type QueueMutatorFn<I extends Item> =
    (localMutator: LocalMutator<I>, remoteMutator: RemoteMutator<I>) => Promise<any>;
