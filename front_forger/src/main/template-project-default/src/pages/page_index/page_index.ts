import { AppNode } from "../../core/app_node";
import { RegClass } from "../../core/serialize";
import PrefabStr from "./page_index.prefab.html?raw"
@RegClass("PageIndex")
export default class PageIndex extends AppNode {
    static get PrefabStr() {
        return PrefabStr;
    }
};