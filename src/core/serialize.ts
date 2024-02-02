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
export const SerializeMetaClassName = "SerializeClassName";

export var NameClassMap = new Map<string, new () => any>();
export var ClassNameMap: Map<new () => any, string> = new Map();
export var ClassProperty: Map<new () => any, PropertyInfo> = new Map();

export function Class2Name(ctor: new () => any) {
    return ClassNameMap.get(ctor);
}
export function Name2Class(cn: string) {
    return NameClassMap.get(cn);
}
export const n2c = Name2Class;
export const c2n = Class2Name;
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

export abstract class CloneAble {
    abstract clone(): CloneAble;
};
export default abstract class SerializeAble extends CloneAble{
    //序列化
    toJSON(): any {
        let json: any = {};
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
    assignFromJSON(json: any) {
        if (typeof json === "string") {
            json = JSON.parse(json);
        }
        let _assign = (obj: Object, property: string | number, cls: new () => SerializeAble, dat: any) => {
            if (typeof dat === "undefined") {

            }
            else if (typeof dat === "number" || typeof dat === "string" || typeof dat === "boolean") {
                obj[property] = dat;
            }
            else if (typeof dat === "object") {
                if (dat instanceof Array) {
                    let list = [];
                    dat.forEach((dc, ind) => {
                        _assign(list, ind, cls, dc);
                    });
                    obj[property] = list;
                }
                else if (cls) {
                    let prop = new cls();
                    prop.assignFromJSON(dat);
                    obj[property] = prop;
                }
                // else if (dat.__cn) {
                //     obj[property] = SerializeAble.CreateFromJSON(dat);
                // }
                else if (obj[property] && obj[property].assignFromJSON) {
                    obj[property].assignFromJSON(dat);
                }
                else {
                    obj[property] = {};
                    for (let key in dat) {
                        _assign(obj[property], key, undefined, dat[key]);
                    }
                }
            }
        };
        if (json) {
            let keys = Object.keys(this);
            for (let i = 0; i < keys.length; i++) {
                let property = keys[i];
                const serializeKey = Reflect.getMetadata(SerializeMetaKey, this, property);
                if (serializeKey) {
                    let data = json[serializeKey];
                    const cls: new () => SerializeAble = Reflect.getMetadata(SerializeMetaClassName, this, property);
                    _assign(this, property, cls, data);
                }
            }
        }
    }
    //反序列化
    static CreateFromJSON<T extends SerializeAble>(json: any, ctor: new () => T = null): T {
        let out: T;
        if (!ctor) {
            if (json && json.__cn) {
                ctor = NameClassMap.get(json.__cn);
            }
        }

        if (ctor) {
            out = new ctor();
            out.assignFromJSON(json);
        }
        else {
            out = json;
        }
        return out as T;
    }
    clone(): CloneAble {
        return SerializeAble.Clone(this);
    }
    static Clone<T extends SerializeAble>(src: T): T {
        return SerializeAble.CreateFromJSON(JSON.parse(JSON.stringify(src)));
    }
};


function NumberToDigitString(num: number, digit: number) {
    let str = num.toFixed(0);
    if (str.length < digit) {
        str = (new Array(digit - str.length).fill("0")).join("") + str;
    }
    return str;
}

export class StrDataReader {
    str = "";
    seek = 0;
    constructor(str: string) {
        this.str = str;
        this.seek = 0;
    }
    isEnd() {
        return this.seek >= this.str.length;
    }
    read(len: number) {
        let str = this.str.substring(this.seek, this.seek + len);
        this.seek += len;
        return str;
    }
    readDynamicString(lenDigit = 2) {
        return this.read(this.readInt(lenDigit));
    }
    readUntil(char: string = "", includeChar = false) {
        let str = "";
        if (!char) {
            str = this.str.substring(this.seek)
            this.seek = this.str.length;
        }
        else {
            while (this.str[this.seek] !== char && this.seek < this.str.length) {
                str += this.str[this.seek++];
            }

            //"]"
            if (!this.isEnd()) {
                if (includeChar) {
                    str += this.str[this.seek++];
                }
                else {
                    this.seek++;
                }
            }
        }
        return str;
    }

    readCondition(cb: (tag: string, res: string) => void, ...condCharList: string[]) {
        let keepSeeking = this.seek < this.str.length;
        let str = "";

        while (keepSeeking) {
            for (let i = 0; i < condCharList.length; i++) {
                if (this.str[this.seek] === condCharList[i]) {
                    keepSeeking = false;
                    str += this.str[this.seek]; //加上最后一个字符
                    this.seek++; //步进
                    cb(condCharList[i], str);
                    break;
                }
            }
            if (keepSeeking) {
                str += this.str[this.seek++];
                keepSeeking = this.seek < this.str.length;
            }
        }
    }
    readInt(len: number) {
        return Number(this.read(len));
    }
    readSignInt(len: number) {
        if (len <= 1) {
            console.error("StrDataReader::readSignInt, len <= 1");
            return 0;
        }
        let signStr = this.read(1);
        let num = this.readInt(len - 1);
        return signStr === "0" ? num : -num;
    }
    readDynamicInt(lenDigit = 2) {
        let digit = this.readInt(lenDigit);
        return this.readInt(digit);
    }
    readDynamicSignInt(lenDigit = 2) {
        let digit = this.readInt(lenDigit);
        return this.readSignInt(digit);
    }
    readBool() {
        return this.read(1) === "1";
    }
};

export class StrDataWriter {
    str = "";

    write(val: string) {
        this.str += val;
        return this;
    }
    writeDynamicString(val: string, lenDigit = 2) {
        this.writeInt(val.length, lenDigit);
        this.write(val);
    }
    writeInt(int: number, digit: number) {
        this.str += NumberToDigitString(int, digit);
        return this;
    }

    writeDynamicInt(int: number, lenDigit = 2) {
        let digit = int.toFixed(0).length;
        this.writeInt(digit, lenDigit);
        this.writeInt(int, digit);
    }

    writeSignInt(int: number, digit: number) {
        if (digit <= 1) {
            console.error("StrDataWriter::writeSignInt, digit <= 1, 位数不够");
            return this;
        }
        let numStr = NumberToDigitString(int, digit - 1);
        numStr = numStr.replace("-", "");
        let signStr = int < 0 ? "1" : "0";
        this.str += signStr + numStr;
        return this;
    }
    writeDynamicSignInt(int: number, lenDigit = 2) {
        let digit = int.toFixed(0).length + 1;
        this.writeInt(digit, lenDigit);
        this.writeSignInt(int, digit);
    }

    writeBool(bool: boolean) {
        this.str += bool ? "1" : "0";
        return this;
    }
};

window["StrDataReader"] = StrDataReader;
window["StrDataWriter"] = StrDataWriter;