import Macro from "./macro";
import SerializeAble, { RegClass, Serialize } from "./serialize";
import { Subject } from "./subject";

export const NATIVE_PATHS = {
    CACHE_DATA: "CacheData", //CacheData 文件
    DIR_SCREEN_SHOTS: "ScreenShots" //ScreenShots 文件夹
};

type Col<T> = { [key: string]: T };

@RegClass("CacheRecord")
export class CacheRecord<T> extends SerializeAble {
    subject: Subject = new Subject();
    @Serialize()
    timestamp: number = 0;
    @Serialize()
    timeDuring: number = 0;
    @Serialize()
    version = "";
    @Serialize()
    data: any = null;

    static Create<T>(data: T, version: string = Macro.APP_VERSION, timestamp = 0) {
        let rec = new CacheRecord<T>();
        rec.data = data;
        rec.timestamp = timestamp;
        rec.version = version;
        return rec;
    }

    static CheckTime<T>(rec: CacheRecord<T>) {
        if (rec.timestamp === 0) {
            return true;
        }
        return Date.now() - rec.timestamp < rec.timeDuring;
    }
    static CheckVersion<T>(rec: CacheRecord<T>, version: string) {
        return version === rec.version;
    }

    isValid() {
        return CacheRecord.CheckTime(this) && CacheRecord.CheckVersion(this, Macro.APP_VERSION);
    }
    toJSON() {
        return super.toJSON();
        // return {
        //     __cn: this.constructor["__cn"],
        //     serialize: this.serialize
        // };
    }

    assignFromJSON(json: any): void {
        super.assignFromJSON(json);
        // this.serialize = json.serialize;
    }
};

@RegClass("CacheRecordCollection")
export class CacheRecordCollection extends SerializeAble {
    @Serialize()
    col: Col<CacheRecord<any>> = {};
    get<T>(key: string):T {
        let rec: CacheRecord<T> = null;
        rec = this.col[key];
        if (!rec || !CacheRecord.CheckVersion(rec, Macro.APP_VERSION)) {
            return undefined;
        }
        return rec.data;
    }
    set<T>(key: string, val: T) {
        let rec: CacheRecord<T> = this.rec(key, val);
        rec.data = val;
        data.save();
        return rec.data;
    }
    rec<T>(key: string, defVal: T) {
        if (!this.has(key)) {
            let rec = CacheRecord.Create<T>(defVal, Macro.APP_VERSION);
            this.col[key] = rec;

            return rec;
        }
        else {
            return this.col[key];
        }
    }
    del(key: string) {
        if (this.col[key]) {
            this.col[key] = null;
            delete this.col[key];
            data.save();
        }
    }
    has(key: string) {
        return this.col[key] && this.col[key].isValid();
    }

    clean() {
        this.col = {};
    }
};

export class CacheData extends SerializeAble {
    //临时
    cache: CacheRecordCollection = new CacheRecordCollection();
    //storage
    @Serialize(CacheRecordCollection)
    storage: CacheRecordCollection = new CacheRecordCollection();

    load() {
        try {
            let jsonStr = "";
            jsonStr = window.localStorage.getItem(`${Macro.APP_NAME}/${NATIVE_PATHS.CACHE_DATA}`);
            if (jsonStr) {
                this.assignFromJSON(jsonStr);
            }
        }
        catch (e) {
            console.error("CacheData::load, error:", e);
        }
    }
    save() {
        try {
            let jsonStr = JSON.stringify(this);
            window.localStorage.setItem(`${Macro.APP_NAME}/${NATIVE_PATHS.CACHE_DATA}`, jsonStr);
        } catch (e) {
            console.error("CacheData::save, error:", e);
        }
    }
};

var data = new CacheData();
export default data;

window["cdata"] = data;