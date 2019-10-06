export interface Type {
  isCompatibleWith(otherType: Type): boolean;
}
