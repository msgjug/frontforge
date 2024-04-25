import { AppNode } from "../core/app_node";
import { RegClass } from "../core/serialize";
import PrefabStr from "./page_home.prefab.html?raw"
@RegClass("PageHome")
export default class PageHome extends AppNode {
    static get PrefabStr() {
        return PrefabStr;
    }
};