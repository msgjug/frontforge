import { AppNode } from "../core/app_node";
import { RegClass } from "../core/serialize";
import PrefabStr from "./{{CLASS_NAME}}.prefab.html?raw"
@RegClass("{{CLASS_NAME_BIG}}")
export default class {{CLASS_NAME_BIG}} extends AppNode {
    static get PrefabStr() {
        return PrefabStr;
    }
};