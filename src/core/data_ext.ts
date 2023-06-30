export type bool = 0 | 1;
export type Collection<T> = { [key: string]: T };
export type Col<T> = Collection<T>;
export type NetData = number | string | bool | boolean | {} | NetData[];
export type AttrData = number | string | bool | boolean;
export type AttrDataType = "" | "number" | "string" | "boolean" | "bool";