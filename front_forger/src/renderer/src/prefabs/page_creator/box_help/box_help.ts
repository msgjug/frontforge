import { AppNode } from "../../../core/app_node";
import { RegClass } from "../../../core/serialize";
import PrefabStr from "./box_help.prefab.html?raw"
@RegClass("BoxHelp")
export default class BoxHelp extends AppNode {
    onClickClose() {
        window.close();
    }
    static get PrefabStr() {
        return PrefabStr;
    }
};