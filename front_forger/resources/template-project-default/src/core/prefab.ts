import { AppNode } from "./app_node";
import { NameClassMap, n2c } from "./serialize";

export default class Prefab {
    //dom string 或 AppNode类
    static Instantiate<T extends AppNode>(ctorOrPrefabStr: string | (new () => T)): T {
        let prefabStr = "";
        let ctor: new () => T = null;
        if (typeof ctorOrPrefabStr === "string") {
            prefabStr = ctorOrPrefabStr;
        }
        else {
            ctor = <new () => T>ctorOrPrefabStr;
            if (!ctor) {
                console.error(`Instantiate, error: 空构造`);
                return null;
            }
            prefabStr = ctor["PrefabStr"];
        }

        let ele = document.createElement("prefab");
        ele.innerHTML = prefabStr;

        let dom = ele.querySelector("dom");
        let style = ele.querySelector("style");
        let bind = ele.querySelector("bind");

        let bindInfo = null;
        if (bind) {
            try {
                bindInfo = JSON.parse(bind.innerHTML.trim());
            } catch (e) {
                console.warn("Instantiate", e);
            }
        }

        if (!ctor) {
            ctor = NameClassMap.get(bindInfo ? bindInfo.name : "AppNode");
        }

        let node: T = new ctor();
        node.init(<HTMLElement>dom.children[0], bindInfo, style);

        return node;
    }
};