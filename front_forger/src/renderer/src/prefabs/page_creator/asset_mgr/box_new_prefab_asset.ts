import Panel from "../../../core/prefabs/panel";
import { RegClass } from "../../../core/serialize";
import EditorEnv from "../../../env";
import { ProtocolObjectPrefabConfig } from "../../../protocol_dist";
import PrefabStr from "./box_new_prefab_asset.prefab.html?raw"

@RegClass("BoxNewPrefabAsset")
export default class BoxNewPrefabAsset extends Panel {
    ebGroup: HTMLInputElement = null;
    ebName: HTMLInputElement = null;

    selGroup: HTMLSelectElement = null;

    onLoad(): void {
        let project = EditorEnv.GetProjectConfig();
        let groups = [];
        project.prefabs_list.forEach(conf => {
            groups.push(conf.group);
        });
        groups = Array.from(new Set(groups));

        let str = "";
        for (let i = 0; i < groups.length; i++) {
            str += `<option value="${groups[i]}">${groups[i]}</option>`;
        }
        this.selGroup.innerHTML = str;
    }

    onSelectGroup(g1, g2) {
        console.log(g1, g2);
    }

    onClickSubmit() {
        let prefabName = this.ebName.value;
        if (!prefabName) {
            return;
        }

        let conf = new ProtocolObjectPrefabConfig();
        conf.group = "prefabs";
        conf.name = prefabName;
        this.subject.emit("new", conf);
        this.dispose();
    }
    static get PrefabStr(): string {
        return PrefabStr;
    }
}