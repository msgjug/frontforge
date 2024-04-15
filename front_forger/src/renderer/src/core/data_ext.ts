export type bool = 0 | 1;
export type NetData = number | string | bool | boolean | {} | NetData[];
export type AttrData = number | string | bool | boolean;
export type AttrDataType = "" | "number" | "string" | "boolean" | "bool";

export type Collection<T> = { [key: string]: T };
export type Col<T> = Collection<T>;

export abstract class CloneAble {
    abstract clone(): CloneAble;
};

export class ResourceReferce<T> {
    protected _ref = 1;
    get ref() {
        return this._ref;
    }
    set ref(val) {
        if (this._ref === val) {
            return;
        }
        this._ref = val;
        if (this._ref <= 0) {
        }
    }

    hasRef() {
        return this._ref > 0;
    }
    res: T = null;

    constructor(res: T) {
        this.res = res;
    }
};