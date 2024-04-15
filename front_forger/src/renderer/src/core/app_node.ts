import { ResourceReferce } from "./data_ext";
import { ClassProperty, PropertyInfo, PropertyRecord, RegClass } from "./serialize";
import { Subject } from "./subject";
import { ArrayUtils } from "./utils";

// 解析DOM节点中的@ 带头的属性
export const AT_KEYS = {
    "@click": "onclick",
    "@change": "onchange",
    "@input": "oninput",
}

export function property(queryStr: string, options?: any) {
    return (target: Object, propertyKey: string): void => {

        let info = ClassProperty.get(<any>target.constructor);
        if (!info) {
            info = new PropertyInfo();
            ClassProperty.set(<any>target.constructor, info);
        }

        let rec = new PropertyRecord();
        rec.key = propertyKey;
        rec.option = options;
        rec.query = queryStr;
        info.recCol[propertyKey] = rec;
    };
}

export function propertys(queryStr: string, options?: any) {
    return (target: Object, propertyKey: string): void => {

        let info = ClassProperty.get(<any>target.constructor);
        if (!info) {
            info = new PropertyInfo();
            ClassProperty.set(<any>target.constructor, info);
        }

        let rec = new PropertyRecord();
        rec.key = propertyKey;
        rec.option = options;
        rec.query = queryStr;
        rec.muti = true;
        info.recCol[propertyKey] = rec;
    };
}

const OPTION_CB_LIST = [
    "onclick",
    "onchange"
];
const STYLE_LIST = [
    "background",
    "backgroundSize"
];

const ATTR_LIST = [
    "src",
    "value",
];

const MEMBER_LIST = [
    "innerText",
    "innerHTML"
];

@RegClass("AppNode")
export class AppNode {
    subject: Subject = new Subject();
    css: Element = null;
    ele: HTMLElement = null;

    children: AppNode[] = [];
    parent: AppNode = null;
    inited = false;

    protected _oldDisplay: string = "";
    get active() {
        return this.ele.style.display !== "none";
    }
    set active(val: boolean) {
        if (this.active && !val) {
            this._oldDisplay = this.ele.style.display
            this.ele.style.display = "none";
        }
        else if (!this.active && val) {
            this.ele.style.display = this._oldDisplay;
        }
    }
    get opacity() {
        return Number(this.ele.style.opacity);
    }
    set opacity(val) {
        this.ele.style.opacity = `${val}`;
    }

    static get PrefabStr(): string {
        return "";
    }
    protected _recBindDom(ele: Element) {
        //$
        if (ele.hasAttribute("$")) {
            let varKey = ele.getAttribute("$");
            if (AppNode.HasOwnPropertyRec(this, varKey)) {
                this[varKey] = ele;
            }
            else {
                console.warn(`$ ${this.constructor.name}, 代码中没有找到 ${varKey}成员`);
            }
        }
        //@
        for (let key in AT_KEYS) {
            if (ele.hasAttribute(key)) {
                let varKey = ele.getAttribute(key);
                if (AppNode.HasOwnPropertyRec(this, varKey)) {
                    ele[AT_KEYS[key]] = this[varKey].bind(this);
                }
                else {
                    console.warn(`${this.constructor.name}, ${key} 代码中没有找到 ${varKey}成员`);
                }
            }
        }
        for (let i = 0; i < ele.children.length; i++) {
            let child = ele.children[i];
            this._recBindDom(child);
        }
    }
    static HasOwnPropertyRec(obj: Object, propName: string) {
        if (obj.hasOwnProperty(propName)) {
            return true;
        }
        else {
            if (obj instanceof AppNode) {
                return AppNode.HasOwnPropertyRec(Object.getPrototypeOf(obj), propName);
            }
            else {
                return false;
            }
        }
    }
    //todo:bindInfo
    init(prefabEle: HTMLElement, bindInfo: any, style: Element = null) {
        if (!prefabEle) {
            console.warn("AppNode::load, warn: ele为空。");
        }
        this.ele = prefabEle;
        this.ele["app_node"] = this;
        if (style) {
            this.css = this.__addCssInHead(style);
        }

        //最新的绑定方式2024-4-15
        this._recBindDom(this.ele);

        //最新绑定方式2024-2-2
        if (bindInfo) {
            for (let i = 0; i < bindInfo.props.length; i++) {
                let rec: PropertyRecord = bindInfo.props[i];
                let eleList = [];

                if (rec.muti) {
                    let list = this.ele.querySelectorAll(rec.query);
                    list.forEach(ele => {
                        eleList.push(ele);
                    });
                    if (eleList.length === 0) {
                        console.warn(`${this.constructor.name}, propertys 没有找到${rec.query}`);
                        continue;
                    }
                }
                else {
                    eleList[0] = this.ele.querySelector(rec.query);
                }

                if (!eleList[0]) {
                    console.warn(`${this.constructor.name}, property 没有找到${rec.query}`);
                    continue;
                }
                else {
                    if (rec.key) {
                        if (rec.muti) {
                            this[rec.key] = eleList;
                        }
                        else {
                            this[rec.key] = eleList[0];
                        }
                    }
                    if (rec.option) {
                        this.__assignOption(rec.key, rec.option, eleList);
                    }
                }
            }
        }
        //最新绑定方式2024-2-2

        let propInfo = ClassProperty.get(<any>this.constructor);
        if (propInfo) {
            let col: { [key: string]: PropertyRecord } = {};

            let supers: PropertyInfo[] = [];
            let ctor = this;
            do {
                ctor = Object.getPrototypeOf(ctor);
                if (ctor) {
                    let info = ClassProperty.get(Object.getPrototypeOf(ctor.constructor));
                    if (info) {
                        supers.push(info);
                    }
                }
                else {
                    break;
                }
            } while (1);

            supers.reverse().forEach(info => {
                Object.assign(col, info.recCol);
            });
            Object.assign(col, propInfo.recCol);

            for (let key in col) {
                let rec = col[key];
                let eleList: Element[] = [];
                if (rec.muti) {
                    let list = this.ele.querySelectorAll(rec.query);
                    list.forEach(ele => {
                        eleList.push(ele);
                    });
                    if (eleList.length === 0) {
                        console.warn(`${this.constructor.name}, propertys 没有找到${rec.query}`);
                        continue;
                    }
                    this[key] = eleList;
                }
                else {
                    eleList[0] = this.ele.querySelector(rec.query);
                    if (!eleList[0]) {
                        console.warn(`${this.constructor.name}, property 没有找到${rec.query}`);
                        continue;
                    }
                    this[key] = eleList[0];
                }
                if (rec.option) {
                    this.__assignOption(key, rec.option, eleList);
                }
            }
        }

        if (this["update"]) {
            this.__updateId = <any>setInterval(this["update"].bind(this), 16);
        }

        this.inited = true;
    }
    private __assignOption(key, option, eleList) {
        OPTION_CB_LIST.forEach(cbName => {
            if (option[cbName]) {
                if (!this[option[cbName]]) {
                    console.warn(`${this.constructor.name}, property option的${cbName}属性，没找到${this.constructor.name}中有${option[cbName]}方法。`);
                }
                else {
                    eleList.forEach(ele => {
                        if (option.args) {
                            ele[cbName] = this[option[cbName]].bind(this, ...option.args);
                        }
                        else {
                            ele[cbName] = this[option[cbName]].bind(this, ele);
                        }
                    });
                }
            }
        });
        STYLE_LIST.forEach(styleKey => {
            if (option[styleKey]) {
                eleList.forEach(ele => {
                    if (!ele["style"]) {
                        return;
                    }
                    ele["style"][styleKey] = option[styleKey];
                });
            }
        });
        ATTR_LIST.forEach(attrKey => {
            if (option[attrKey]) {
                eleList.forEach(ele => {
                    ele.setAttribute(attrKey, option[attrKey]);
                });
            }
        });
        MEMBER_LIST.forEach(memKey => {
            if (option[memKey]) {
                eleList.forEach(ele => {
                    ele[memKey] = option[memKey];
                });
            }
        });

        if (option["isNode"] && key) {
            if (this[key] instanceof Array) {
                let list = this[key].slice();
                list.forEach((ele, ind) => {
                    this[key][ind] = eleList[ind]["app_node"];
                });
            }
            else {
                this[key] = eleList[0]["app_node"];
            }
        }
    }

    addChild(child: AppNode, targetEle?: Element | string) {
        if (child.parent) {
            console.error("AppNode::addChild, error: child 已有 parent");
            return;
        }
        child.parent = this;
        this.children.push(child);

        if (targetEle) {
            if (typeof targetEle === "string") {
                targetEle = this.ele.querySelector(targetEle);
            }
        }
        else {
            targetEle = this.ele;
        }
        targetEle.appendChild(child.ele);

        child.onLoad();
    }
    getChildren(targetEle?: Element | string) {
        if (!targetEle) {
            return this.children;
        }

        if (targetEle) {
            if (typeof targetEle === "string") {
                targetEle = this.ele.querySelector(targetEle);
            }
        }
        else {
            targetEle = this.ele;
        }

        return this.children.filter(child => child.ele.parentElement == targetEle);
    }
    removeChild(child: AppNode) {
        ArrayUtils.remove(this.children, child);
        child.ele.remove();
        child.parent = null;
    }

    removeAllChildren(targetEle?: Element | string) {
        if (targetEle) {
            if (typeof targetEle === "string") {
                targetEle = this.ele.querySelector(targetEle);
            }
        }
        else {
            targetEle = this.ele;
        }

        let list = this.children.slice();
        list.forEach(child => {
            if (!targetEle || child.ele.parentElement == targetEle) {
                this.removeChild(child);
            }
        });
    }
    disposeAllChildren(targetEle?: Element | string) {
        if (targetEle) {
            if (typeof targetEle === "string") {
                targetEle = this.ele.querySelector(targetEle);
            }
        }
        else {
            targetEle = this.ele;
        }

        let list = this.children.slice();
        list.forEach(child => {
            if (!targetEle || child.ele.parentElement == targetEle) {
                child.dispose();
            }
        });
    }

    dispose() {
        if (this.parent) {
            this.parent.removeChild(this);
        }
        if (this.ele) {
            this.ele.remove();
            this.ele = null;
        }
        if (this.css) {
            this.__removeCssFromHead(this.css);
            this.css = null;
        }
        if (this.__updateId) {
            clearInterval(this.__updateId);
            this.__updateId = 0;
        }

        this.onDispose();
    }
    onLoad() { }
    onDispose() { }

    private static __CssRefPool: ResourceReferce<Element>[] = [];
    private __updateId = 0;
    private __addCssInHead(css: Element) {
        let ind = this.__findCssIndex(css);
        if (ind !== -1) {
            AppNode.__CssRefPool[ind].ref++;
            return AppNode.__CssRefPool[ind].res;
        }
        else {
            css.setAttribute("type", "text/css");
            let rr = new ResourceReferce(css);
            AppNode.__CssRefPool.push(rr);
            document.head.appendChild(css);
            return rr.res;
        }
    }
    private __removeCssFromHead(css: Element) {
        let ind = this.__findCssIndex(css);
        if (ind === -1) {
            return;
        }

        let rr = AppNode.__CssRefPool[ind];
        rr.ref--;
        if (!rr.hasRef()) {
            AppNode.__CssRefPool.splice(ind, 1)[0].res.remove();
        }
    }

    private __findCssIndex(css: Element) {
        return AppNode.__CssRefPool.findIndex(ele => ele.res.innerHTML === css.innerHTML);
    }
};