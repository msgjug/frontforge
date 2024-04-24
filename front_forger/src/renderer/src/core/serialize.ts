
export class PropertyRecord {
    key: string = "";
    query: string = "";
    option: any = null;
    muti = false;
};
export class PropertyInfo {
    recCol: { [key: string]: PropertyRecord } = {};
    super: string = "";
};

// 记录类的序列化结构
export class ClassSerializeInfo {
    ctor: Function = null!; //类构造
    memberList: string[] = []; //成员名 
    memberCtorList: string[] = []; //成员类名，如果是基础属性，则为空字符串

    constructor(ctor) {
        this.ctor = ctor;
    }

    addSerialize(key: string, ctorName: string = "") {
        this.memberList.push(key);
        this.memberCtorList.push(ctorName);
    }
};
export const ClassSerializeInfoMap = new Map<any, ClassSerializeInfo>(); //类的序列化结构 MAP
export var NameClassMap = new Map<string, new () => any>();
export var ClassNameMap: Map<new () => any, string> = new Map();
export var ClassProperty: Map<new () => any, PropertyInfo> = new Map();

export function Class2Name(ctor: new () => any) {
    return ClassNameMap.get(ctor);
}
export function Name2Class(cn: string) {
    return NameClassMap.get(cn);
}
export function GetCSIByClass(ctor: any) { //类 -> 序列化结构
    return ClassSerializeInfoMap.get(ctor);
};
export function GetCSI(cn: string) { //类名 -> 序列化结构
    return GetCSIByClass(n2c(cn));
}
export const n2c = Name2Class;
export const c2n = Class2Name;
//序列化装饰器

//成员序列化，CLS为成员类型
export function Serialize<T>(cls?: new () => T) {
    return (target: Object, property: string): void => {
        if (!ClassSerializeInfoMap.get(target.constructor)) {
            ClassSerializeInfoMap.set(target.constructor, new ClassSerializeInfo(target.constructor));
        }
        let csi = ClassSerializeInfoMap.get(target.constructor)!;
        csi.addSerialize(property, cls ? cls["__cn"] : "");
    };
}
export function RegClass(regClassName: string) {
    return function (ctor: any): void {
        // console.log("REG CLASS:", regClassName);
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
export default abstract class SerializeAble extends CloneAble {
    toJSON(): any {
        let json: any = {
            __cn: this.constructor["__cn"],
        };
        let _assign = (dat: any, property: string | number, obj: any) => {
            if (obj[property] !== undefined && obj[property] !== null) {
                if (obj[property].toJSON) {
                    dat[property] = obj[property].toJSON();
                }
                else if (typeof obj[property] === "object" && obj[property] instanceof Array) {
                    let list = [];
                    obj[property].forEach((ele, ind) => {
                        _assign(list, ind, obj[property]);
                    });
                    dat[property] = list;
                }
                else {
                    dat[property] = obj[property];
                }
            }
        };
        let csi = GetCSIByClass(this.constructor)!;
        csi.memberList.forEach(sKey => {
            _assign(json, sKey, this);
        });
        return json;
    }
    assignFromJSON(json: any) {
        if (typeof json === "string") {
            json = JSON.parse(json);
        }
        let _assign = (obj: Object, property: string | number, cls: new () => SerializeAble, dat: any) => {
            if (dat === undefined) {

            }
            else if (dat === null) {

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
                else if (dat.__cn) {
                    if (obj[property] && obj[property].assignFromJSON) {
                        obj[property].assignFromJSON(dat);
                    }
                    else {
                        obj[property] = SerializeAble.CreateFromJSON(dat, n2c(dat.__cn));
                    }
                }
                else if (obj[property] && obj[property].assignFromJSON) {
                    obj[property].assignFromJSON(dat);
                }
                else {
                    obj[property] = {};
                    for (let key in dat) {
                        _assign(obj[property], key, undefined!, dat[key]);
                    }
                }
            }
        };
        if (json) {
            let csi = GetCSIByClass(this.constructor)!;
            csi.memberList.forEach((sKey, ind) => {
                let dat = json[sKey];
                let cls: new () => SerializeAble;
                if (csi.memberCtorList[ind]) {
                    cls = n2c(csi.memberCtorList[ind])!;
                }
                _assign(this, sKey, cls!, dat);
            });
        }
    }
    //反序列化
    static CreateFromJSON<T extends SerializeAble>(json: any, ctor: new () => T = null!): T {
        let out: T;
        if (!ctor) {
            if (json && json.__cn) {
                ctor = NameClassMap.get(json.__cn)!;
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