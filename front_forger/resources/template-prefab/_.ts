import { AppNode } from "../../core/app_node";
import { RegClass } from "../../core/serialize";
import PrefabStr from "./page_index.prefab.html?raw"
@RegClass("{{CLASS_NAME}}")
export default class {{CLASS_NAME}} extends AppNode {
    static get PrefabStr() {
        return PrefabStr;
    }
};