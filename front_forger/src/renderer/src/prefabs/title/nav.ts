import { AppNode } from "../../core/app_node";
import Macro from "../../core/macro";
import { RegClass } from "../../core/serialize";
import PrefabStr from "./nav.prefab.html?raw";
@RegClass("Nav")
export default class Nav extends AppNode {
    lbTitle: HTMLDivElement = null;

    onLoad(): void {
        this.lbTitle.innerText = Macro.APP_NAME;
    }
    onClickClose(){
        window.close();
    }
    static get PrefabStr(): string {
        return PrefabStr;
    }
};