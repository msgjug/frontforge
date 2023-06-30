import { Col } from "./data_ext";
import { ClassProperty, PropertyInfo, PropertyRecord, RegClass } from "./serialize";
import { Subject } from "./subject";
import { ArrayUtils } from "./utils";


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
        rec.queryStr = queryStr;
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
        rec.queryStr = queryStr;
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

    init(prefabEle: HTMLElement, style: Element = null) {
        if (!prefabEle) {
            console.warn("AppNode::load, warn: ele为空。");
        }
        this.ele = prefabEle;
        this.ele["app_node"] = this;
        if (style) {
            this.css = style;
            this.css.setAttribute("type", "text/css");
            this.__addCssInHead(this.css);
        }

        let propInfo = ClassProperty.get(<any>this.constructor);
        if (propInfo) {
            let col: Col<PropertyRecord> = {};

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
                    let list = this.ele.querySelectorAll(rec.queryStr);
                    list.forEach(ele => {
                        eleList.push(ele);
                    });
                    if (eleList.length === 0) {
                        console.warn(`${this.constructor.name}, propertys 没有找到${rec.queryStr}`);
                        continue;
                    }
                    this[key] = eleList;
                }
                else {
                    eleList[0] = this.ele.querySelector(rec.queryStr);
                    if (!eleList[0]) {
                        console.warn(`${this.constructor.name}, property 没有找到${rec.queryStr}`);
                        continue;
                    }
                    this[key] = eleList[0];
                }
                if (rec.option) {
                    OPTION_CB_LIST.forEach(cbName => {
                        if (rec.option[cbName]) {
                            if (!this[rec.option[cbName]]) {
                                console.warn(`${this.constructor.name}, property option的${cbName}属性，没找到${this.constructor.name}中有${rec.option[cbName]}方法。`);
                            }
                            else {
                                eleList.forEach(ele => {
                                    ele[cbName] = this[rec.option[cbName]].bind(this, ele);
                                });
                            }
                        }
                    });
                    STYLE_LIST.forEach(styleKey => {
                        if (rec.option[styleKey]) {
                            eleList.forEach(ele => {
                                if (!ele["style"]) {
                                    return;
                                }
                                ele["style"][styleKey] = rec.option[styleKey];
                            });
                        }
                    });

                    if (rec.option["isNode"]) {
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
            }
        }

        if (this["update"]) {
            this.__updateId = setInterval(this["update"].bind(this), 16);
        }

        this.inited = true;
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
    removeChild(child: AppNode) {
        ArrayUtils.remove(this.children, child);
        child.ele.remove();
        child.parent = null;
    }

    removeAllChildren() {
        let list = this.children.slice();
        list.forEach(child => {
            this.removeChild(child);
        });
    }
    disposeAllChildren() {
        let list = this.children.slice();
        list.forEach(child => {
            child.dispose();
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

    private static __CssPool: Element[] = [];
    private __updateId = 0;
    private __addCssInHead(css: Element) {
        if (ArrayUtils.contains(AppNode.__CssPool, css)) {
            return;
        }
        AppNode.__CssPool.push(css);
        document.head.appendChild(css);
    }
    private __removeCssFromHead(css: Element) {
        if (!ArrayUtils.contains(AppNode.__CssPool, css)) {
            return;
        }
        ArrayUtils.remove(AppNode.__CssPool, css);
        css.remove();
    }
};

window["an"] = AppNode;