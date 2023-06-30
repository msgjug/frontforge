import { AppNode } from "./app_node";
import { RegClass } from "./serialize";
import PrefabStr from "./prefabs/scene.prefab.html?raw"
import Prefab from "./prefab";
import Toast from "./prefabs/toast";
@RegClass("Scene")
export default class Scene extends AppNode {
    stamp: string = "";
    curPage: AppNode = null;

    replacePage(node: AppNode, stamp?: string) {
        if (stamp) {
            if (this.stamp === stamp) {
                return;
            }
            this.stamp = stamp;
        }
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
};

Scene["PrefabStr"] = PrefabStr;