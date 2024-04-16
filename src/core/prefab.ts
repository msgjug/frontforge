import { AppNode } from "./app_node";
import { NameClassMap, n2c } from "./serialize";

export default class Prefab {
    static Instantiate<T extends AppNode>(ctorOrPrefabStr: new () => T | string): T {
        let prefabStr = "";
        let ctor: any = null;
        if (typeof ctorOrPrefabStr === "string") {
            prefabStr = ctorOrPrefabStr;
        }
        else {
            ctor = ctorOrPrefabStr;
            prefabStr = ctorOrPrefabStr["PrefabStr"];
        }

        let ele = document.createElement("div");
        ele.innerHTML = prefabStr;

        let dom = ele.querySelector("dom");
        let style = ele.querySelector("style");
        if (!ctor) {
            let nodeCtorName = dom.getAttribute("ctor") || "AppNode";
            ctor = NameClassMap.get(nodeCtorName);
        }

        let node: T = new ctor();
        {//children
            let childEle = ele.querySelectorAll("node");
            childEle.forEach(childEle => {
                let childCtorName = childEle.innerHTML;
                let childCtor = n2c(childCtorName);
                let child = Prefab.Instantiate(childCtor);
                child.parent = node;
                childEle.parentElement.replaceChild(child.ele, childEle);
                node.children.push(child);
                //todo: 这里child 的onLoad比parent更早执行，应该是更迟才是合理的。
                child.onLoad();
            });
        }
        node.init(<HTMLElement>dom.children[0], style);

        return node;
    }
};