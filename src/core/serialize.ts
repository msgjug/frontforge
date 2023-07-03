import "reflect-metadata";
import { Col } from "./data_ext";
export class PropertyRecord {
    key: string = "";
    queryStr: string = "";
    option: any = null;
    muti = false;
};
export class PropertyInfo {
    recCol: Col<PropertyRecord> = {};
    super: string = "";
};

export const SerializeMetaKey = "Serialize";


export var NameClassMap = new Map<string, new () => any>();
export var ClassNameMap: Map<new () => any, string> = new Map();
export var ClassProperty: Map<new () => any, PropertyInfo> = new Map();

export function Class2Name(ctor: new () => any) {
    return ClassNameMap.get(ctor);
}
export function Name2Class(cn: string) {
    return NameClassMap.get(cn);
}
export var n2c = Name2Class;
export var c2n = Class2Name;
//序列化装饰器
export function Serialize(name?: string) {
    return (target: Object, property: string): void => {
        Reflect.defineMetadata(SerializeMetaKey, name || property, target, property);
    };
}
export function RegClass(regClassName: string) {
    return function (ctor: any): void {
        ctor.__cn = regClassName;
        NameClassMap.set(ctor.__cn, ctor);
        ClassNameMap.set(ctor, ctor.__cn);
        
        let info = ClassProperty.get(<any>ctor);
        if (!info) {
            info = new PropertyInfo();
            ClassProperty.set(<any>ctor, info);
        }
    }
}

export default abstract class SerializeAble {
    protected static __cn: string = "SerializeAble";
    //序列化
    toJSON(): any {
        let json = {
            //@ts-ignore
            __cn: this.constructor.__cn
        };
        Object.keys(this).forEach(property => {
            const serialize = Reflect.getMetadata(SerializeMetaKey, this, property);
            if (serialize) {
                if (this[property] instanceof SerializeAble) {
                    json[serialize] = this[property].toJSON();
                } else {
                    json[serialize] = this[property];
                }
            }
        });
        return json;
    }
    fromJSON(json: any) {
        if (typeof json === "string") {
            json = JSON.parse(json);
        }
        let _assign = (obj: Object, property: string, data) => {
            if (data === null || data === undefined) {
                obj[property] = null;
            }
            else if (typeof data === "object" && data instanceof Array) {
                let list = [];
                data.forEach((dc, ind) => {
                    list[ind] = SerializeAble.CreateFromJSON(dc);
                });
                obj[property] = list;
            }
            else if (typeof data === "object" && data.__cn) {
                obj[property] = SerializeAble.CreateFromJSON(data);
            }
            else {
                if (data !== undefined) {
                    obj[property] = data;
                }
            }
        };
        json && Object.keys(this).forEach(property => {
            const serialize = Reflect.getMetadata(SerializeMetaKey, this, property);
            if (serialize) {
                let data = json[serialize];
                _assign(this, property, data);
            }
        });
    }
    //反序列化
    static CreateFromJSON<T extends SerializeAble>(json: any): T {
        let out: T;
        if (json && json.__cn) {
            let ctor = NameClassMap.get(json.__cn);
            out = new ctor();
            out.fromJSON(json);
        }
        else {
            out = json;
        }
        return out as T;
    }

    static Clone<T extends SerializeAble>(src: T): T {
        return SerializeAble.CreateFromJSON(JSON.parse(JSON.stringify(src)));
    }
};