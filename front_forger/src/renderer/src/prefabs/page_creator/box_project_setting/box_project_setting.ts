import Panel from "../../../core/prefabs/panel";
import { RegClass } from "../../../core/serialize";
import PrefabStr from "./box_project_setting.prefab.html?raw"
@RegClass("BoxProjectSetting")
export default class BoxProjectSetting extends Panel {
    onLoad(): void {
    }
    static get PrefabStr() {
        return PrefabStr;
    }
};