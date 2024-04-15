import Macro from "./macro";
import SerializeAble, { RegClass, Serialize } from "./serialize";
import { Subject } from "./subject";
import { Uid } from "./utils";

@RegClass("CacheRecord")
export class CacheRecord<T> extends SerializeAble {
    subject: Subject = new Subject();
    @Serialize()
    timestamp: number = 0;
    @Serialize()
    timeDurling: number = 0;
    @Serialize()
    version = "";
    @Serialize()
    data: T;

    static Create<T>(data: T, version: string = Macro.APP_VERSION) {
        let rec = new CacheRecord<T>();
        rec.data = data;
        rec.timestamp = Date.now();
        rec.version = version;
        return rec;
    }

    static CheckTime<T>(rec: CacheRecord<T>) {
        return Date.now() - rec.timestamp < rec.timeDurling;
    }
    static CheckVersion<T>(rec: CacheRecord<T>, version: string) {
        return version === rec.version;
    }
};

@RegClass("CacheRecordStorage")
export class CacheRecordStorage extends SerializeAble {
    storage: { [key: string]: CacheRecord<any> } = {};

    get<T>(key: string) {
        let rec: CacheRecord<T> = this.storage[key];
        return rec;
    }
    isValid(key: string) {
        let rec = this.get(key);
        return rec && CacheRecord.CheckVersion(rec, Macro.APP_VERSION) && CacheRecord.CheckTime(rec);
    }
    create<T>(key: string, dat: T, time = 60000) {
        let rec = CacheRecord.Create(dat);
        rec.timeDurling = time;
        this.storage[key] = rec;
        return rec;
    }
    clear() {
        this.storage = {};
    }
};


@RegClass("CacheData")
export class CacheData extends SerializeAble {
    subject: Subject = new Subject();
    @Serialize()
    protected _sessToken = "";
    get sessToken() {
        if (!this._sessToken) {
            this._sessToken = Uid.getUid(20);
            this.save();
        }
        return this._sessToken;
    }

    cache: CacheRecordStorage = new CacheRecordStorage();
    @Serialize()
    storage: CacheRecordStorage = new CacheRecordStorage();

    load() {
        try {
            let jsonStr = "";
            jsonStr = window.localStorage.getItem(`${Macro.APP_NAME}/CacheData`);
            if (jsonStr) {
                this.assignFromJSON(JSON.parse(jsonStr));
            }
        }
        catch (e) {
            console.error("CacheData::load, error:", e);
        }
    }
    save() {
        try {
            let jsonStr = JSON.stringify(this);
            window.localStorage.setItem(`${Macro.APP_NAME}/CacheData`, jsonStr);
        } catch (e) {
            console.error("CacheData::save, error:", e);
        }
    }
};

var data = new CacheData();
export default data;
window["cdata"] = data;