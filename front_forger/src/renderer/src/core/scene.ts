import { AppNode } from "./app_node";
import { RegClass } from "./serialize";
import PrefabStr from "./prefabs/scene.prefab.html?raw"
import Prefab from "./prefab";
import Toast from "./prefabs/toast";
@RegClass("Scene")
export default class Scene extends AppNode {
    curPage: AppNode = null;

    replacePage(node: AppNode) {
        if (this.curPage) {
            this.curPage.dispose();
        }
        this.addChild(node);
        this.curPage = node;
    }
    
    toast(text: string, sec: number = 2) {
        let toast = Prefab.Instantiate(Toast);
        this.addChild(toast, "div[class=toast-container]");
        toast.show(text, sec);
    }
    static get PrefabStr(): string {
        return PrefabStr;
    }
};
