import { Item } from './item';

/**
 * Describes an API interface for updating the data.
 */
export interface UpdateApi<I extends Item, UR> {
  add(item: I): Promise<void>;

  delete(id: string): Promise<void>;

  generateId(): Promise<string>;

  update(request: UR): Promise<void>;
}
