import data from "./cache_data";
import { HttpRequest } from "./http_request";
import Scene from "./prefabs/scene";
import { c2n, n2c } from "./serialize";
import { Subject } from "./subject";
import WebApplication from "./web_application";

class UrlParam {
    [key: string]: string;
};
export default class Utils {
    static app: WebApplication = null;
    static scene: Scene = null;

    /**解析url */
    static parseUrlParam(decodeURI = false): UrlParam {
        let url = window.location.href;
        let parse = url.substring(url.indexOf("?") + 1);
        let params = parse.split("&");
        let len = params.length;
        let item = [];
        let param = new UrlParam();
        for (let i = 0; i < len; i++) {
            item = params[i].split("=");
            if (decodeURI) {
                param[item[0]] = decodeURIComponent(item[1]);
            }
            else {
                param[item[0]] = item[1];
            }
        }

        return param;
    }
    /** 深拷贝 */
    static cloneDeep(obj: any) {
        if (obj == null) {
            return null;
        }
        if (typeof obj == 'object') {
            return JSON.parse(JSON.stringify(obj));
        }
        return obj;
    }

    static UnUseObject(obj: any, deepDown = false) {
        if (typeof obj == "object") {
            return;
        }
        Object.getOwnPropertyNames(obj).forEach(key => {
            switch (true) {
                case typeof obj[key] == "object":
                    if (deepDown) {
                        Utils.UnUseObject(obj[key], deepDown);
                    }
                    break;
                case typeof obj[key] == "number":
                    obj[key] = 0;
                    break;
                case typeof obj[key] == "string":
                    obj[key] = "";
                    break;
                default:
                    obj[key] = null;
                    break;
            }
        });
    }
    //时间戳 -> 日期
    static TimestampToTime(timestamp: number, format: string = "") {
        if (timestamp < 9999999999) {
            timestamp *= 1000;
        }
        var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
        var Y = date.getFullYear();
        var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
        var D = date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate();
        var h = date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours();
        var m = date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes();
        var s = date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds();

        if (format) {
            //@ts-ignore
            return format.replace(/Y/, Y).replace(/M/, M).replace(/D/, D).replace(/h/, h).replace(/m/, m).replace(/s/, s);
        }
        else {
            return `${Y}年${M}月${D}日 ${h}:${m}:${s}`;
        }
    }

    static InvertColor(r, g, b) {
        return [(255 - r), (255 - g), (255 - b)];
    }

    static NumberToDigitString(num: number, digit: number) {
        let str = num.toFixed(0);
        if (str.length < digit) {
            str = (new Array(digit - str.length).fill("0")).join("") + str;
        }
        return str;
    }

    static Post(action: string, msg: any = {}) {
        let dat: any = {
            action: action,
        };
        Object.assign(dat, msg);
        return HttpRequest.Post("REQ")
            // .setHeader({
            //     "Sess-Token": data.sessToken
            // })
            .setBody(dat);
    }

    static Get(action: string, msg: any = {}) {
        let dat: any = {
            action: action,
        };
        Object.assign(dat, msg);
        return HttpRequest.Get("REQ")
            // .setHeader({
            //     "Sess-Token": data.sessToken
            // })
            .setParam(dat);
    }

};

export class H5Utils {
    static get IsMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    /**
     * 让一个ele变成可拖拽
     * @param element 移动的ELE
     * @param container 限制框
     * @param handler 实际拖动的 ELE，可以是element的子元素
     */
    static DragElement(element, container = null, handler = null) {
        let dtX = 0, dtY = 0, pX = 0, pY = 0;

        if (!handler) {
            handler = element;
        }
        handler.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // 获取鼠标指针的位置
            pX = e.clientX;
            pY = e.clientY;
            document.onmouseup = closeDragElement;
            // 调用函数当鼠标移动时
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // 计算新的元素位置
            dtX = pX - e.clientX;
            dtY = pY - e.clientY;
            pX = e.clientX;
            pY = e.clientY;
            // 设置元素的新位置，并限制在容器内
            let newTop = (element.offsetTop - dtY);
            let newLeft = (element.offsetLeft - dtX);
            if (container) {
                // 限制在顶部和底部
                if (newTop < 0) {
                    newTop = 0;
                } else if (newTop > (0 + container.offsetHeight - element.offsetHeight)) {
                    newTop = 0 + container.offsetHeight - element.offsetHeight;
                }
                // 限制在左侧和右侧
                if (newLeft < 0) {
                    newLeft = 0;
                } else if (newLeft > (0 + container.offsetWidth - element.offsetWidth)) {
                    newLeft = 0 + container.offsetWidth - element.offsetWidth;
                }
            }
            // 设置元素的新位置
            element.style.top = newTop + "px";
            element.style.left = newLeft + "px";
        }

        function closeDragElement() {
            // 停止移动时，取消事件监听器
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    static ScrollBottom() {
        let scrollOptions: ScrollToOptions = {
            left: 0,
            top: 999999999999999999,
            behavior: 'smooth'
        };
        window.scrollTo(scrollOptions);
    }

    static ScrollTop() {
        let scrollOptions: ScrollToOptions = {
            left: 0,
            top: 0,
            behavior: 'smooth'
        };
        window.scrollTo(scrollOptions);
    }
};

export class rAF {
    //封装动画RAF函数  代替定时器
    static queue: any = [];
    static rafId = 0;
    static rafStart(t) {
        rAF.queue.forEach((o) => {
            if (o.intervalTime == undefined || o.lastTime == 0 || t - o.lastTime >= o.intervalTime) {
                o.fn(t);
                o.lastTime = t;
                return;
            };
        });
        if (rAF.queue.length) {
            window.requestAnimationFrame(rAF.rafStart);
        }
    }
    static set(fn, intervalTime?) {
        rAF.rafId++;
        rAF.queue.push({
            fn,
            intervalTime,
            lastTime: 0,
            id: rAF.rafId
        });
        if (rAF.queue.length === 1) {
            window.requestAnimationFrame(rAF.rafStart);
        }
        return rAF.rafId;
    }
    static clear(id) {
        for (let i = 0; i < rAF.queue.length; i++) {
            if (rAF.queue[i].id == id) {
                rAF.queue.splice(i, 1);
                break;
            };
        };
    }
};

export class Random {
    static range(min: number, max: number) {
        return Math.floor(Math.random() * (max - min) + min);
    }
    static rangeRound(min: number, max: number) {
        return Math.round(Math.random() * (max - min) + min);
    }
    static rangeCeil(min: number, max: number) {
        return Math.ceil(Math.random() * (max - min) + min);
    }
    static bool(percent: number) {
        return (Math.random() < percent);
    }
    static selecter(...args: any[]) {
        return args[Random.range(0, args.length)];
    }
    static splitValue(total: number, count: number, diffRange: number = 0) {

        let yu = total % count;
        let iVal = total - yu;
        let avg = iVal / count;

        let sum = 0;
        let arr = [];
        for (let i = 0; i < count; i++) {
            let dt = Math.round((Math.random() > 0.5 ? -1 : 1) * Math.random() * diffRange);
            let val = avg + dt;

            if (yu > 0) {
                yu--;
                val++;
            }

            arr.push(val);
            sum += val;
        }

        if (sum != total) {
            let totalDt = sum - total;
            let yuDt = totalDt % count;
            let iValDt = totalDt - yuDt;
            let avgDt = (iValDt != 0 ? iValDt / count : 0);
            for (let i = 0; i < arr.length; i++) {
                arr[i] -= avgDt;
                if (yuDt > 0) {
                    yuDt--;
                    arr[i]--;
                }
                else if (yuDt < 0) {
                    yuDt++;
                    arr[i]++;
                }
            }
        }

        return arr;
    }
};


/** 获取随机字符串，最大15位。 */
export class Uid {
    static get0x(x: number) {
        return Math.floor(Math.random() * x + 1);
    }
    private static _lastUidTime = 0;
    static getUid(digit = 15) {
        if (digit >= 15) {
            digit = 15;
        }
        let now = Date.now();
        if (this._lastUidTime === now) {
            now++;
        }
        this._lastUidTime = now;
        return ("" + this._lastUidTime + Uid.get0x(99)).slice(15 - digit, 15);
    }
};

export class Sync {
    // static NextUpdate() {
    //     return new Promise<void>(ok => cc.director.once(cc.Director.EVENT_AFTER_UPDATE, ok));
    // }
    static DelayTime(time: number) {
        return new Promise<void>(ok => setTimeout(ok, time * 1000));
    }
    // static AnimationEnd(aniName: string, ani: cc.Animation) {
    //     return new Promise<void>(ok => {
    //         let _ok = () => {
    //             ani.targetOff(this);
    //             ok();
    //         };
    //         ani.once(cc.Animation.EventType.FINISHED, _ok, this);
    //         ani.once(cc.Animation.EventType.STOP, _ok, this);
    //         ani.play(aniName);
    //     });
    // }
    static SubjectMessage<T>(eventName: string | { new(): T }, sub: Subject) {
        if (typeof eventName !== "string") {
            eventName = c2n(eventName);
        }
        return new Promise<T>(ok => sub.once(<string>eventName, ok, this));
    }
    static SubjectMutiMessage<T>(eventNames: (string | { new(): T })[], sub: Subject) {
        let pms: Promise<T>[] = [];
        eventNames.forEach(en => {
            pms.push(this.SubjectMessage(en, sub));
        });
        return Promise.race(pms);
    }
    // //会调用cc.Tween.start
    // static TweenEnd(tween: cc.Tween) {
    //     return new Promise<void>(ok => tween.call(ok).start());
    // }
};

export class Syncer<T> {
    private __syncCallback: (val: T) => void = null;
    private __syncCancelCallback: (val: T) => void = null;
    async() {
        return new Promise<T>((ok, cancel) => {
            this.__syncCallback = ok;
            this.__syncCancelCallback = cancel;
        });
    }
    finish(val: T) {
        this.__syncCallback && this.__syncCallback(val);
        this.__syncCallback = null;
    }
    cancel() {
        this.__syncCancelCallback && this.__syncCancelCallback(null);
        this.__syncCancelCallback = null;
    }
};

export class ArrayUtils {
    static contains(arr: any[], obj: any): boolean {
        return -1 !== arr.findIndex(ele => ele === obj);
    }
    static remove(arr: any[], obj: any) {
        let ind = arr.findIndex(ele => ele === obj);
        if (ind !== -1) {
            arr.splice(ind, 1);
        }
    }
}

export class DelayCaller {
    private __caller: any = null;
    private __calls: any[] = [];
    constructor(caller: any) {
        this.__caller = caller;
    }
    add(cbName: string, ...args: any[]): any {
        this.__calls.push([cbName, args]);
    }
    execAll() {
        let rtns = [];
        while (this.__calls.length > 0) {
            let [cbName, args] = this.__calls.shift();
            rtns.push(this.__caller[cbName](...args));
        }
        return rtns;
    }
    exec() {
        if (this.__calls.length > 0) {
            let [cbName, args] = this.__calls.shift();
            return this.__caller[cbName](...args);
        }
    }
};
