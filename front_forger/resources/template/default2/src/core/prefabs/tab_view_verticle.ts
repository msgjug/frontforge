import { RegClass } from "../serialize";
import TabView from "./tab_view";
import PrefabStr from "./tab_view_verticle.prefab.html?raw"

@RegClass("TabViewVerticle")
export default class TabViewVerticle extends TabView {
    static get __BindPrefab__() {
        return PrefabStr;
    }
};