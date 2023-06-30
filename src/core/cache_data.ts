import UserData from "../datas/user_data";
import Macro from "./macro";
import SerializeAble, { RegClass, Serialize } from "./serialize";
import { Subject } from "./subject";
import { Uid } from "./utils";


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

    @Serialize()
    fontSize = 12;

    @Serialize()
    editorTheme = "ambiance";

    @Serialize()
    welcomeTime = 0;

    _userData: UserData = null;
    get userData() {
        return this._userData;
    }

    set userData(val) {
        this._userData = val;
        this.subject.emit(Macro.EVENTS.USER_INFO_UPDATE);
    }

    load() {
        try {
            let jsonStr = "";
            jsonStr = window.localStorage.getItem(`${Macro.APP_NAME}/CacheData`);
            if (jsonStr) {
                this.fromJSON(JSON.parse(jsonStr));
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