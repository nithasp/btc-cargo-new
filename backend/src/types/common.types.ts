export type Json = Record<string, unknown>;

export type PartialUpdate<T> = { [K in keyof T]?: T[K] | undefined };

export interface NamedRef {
  id: number;
  name: string;
}
