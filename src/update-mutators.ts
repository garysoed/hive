import { Item } from './item';

/**
 * Mutators for executing an update.
 */
export interface UpdateMutators<T extends Item, UR> {
  localMutator(item: T): T;
  remoteMutator(item: T): UR;
}
