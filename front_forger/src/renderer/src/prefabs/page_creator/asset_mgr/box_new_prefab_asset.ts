import { electron } from "process";
import Panel from "../../../core/prefabs/panel";
import { RegClass } from "../../../core/serialize";
import EditorEnv from "../../../env";
import { ProtocolObjectIPCResponse, ProtocolObjectPrefabConfig } from "../../../protocol_dist";
import PrefabStr from "./box_new_prefab_asset.prefab.html?raw"
import Utils from "../../../core/utils";

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

        this.ebGroup.value = this.selGroup.value;
    }

    onSelectGroup(evt) {
        this.ebGroup.value = evt.target.value
    }

    async onClickSubmit() {
        let prefabName = this.ebName.value;
        if (!prefabName) {
            return;
        }
        let groupName = this.ebGroup.value;
        if (!groupName) {
            return;
        }

        let conf = new ProtocolObjectPrefabConfig();
        conf.group = groupName;
        conf.name = prefabName;
        let rsp: ProtocolObjectIPCResponse = await window.electron.ipcRenderer.invoke("FF:NewPrefabAsset", prefabName, EditorEnv.GetProjectConfig());
        if (rsp.ret) {
            Utils.app.msgBox(rsp.msg, "错误");
            return;
        }
        this.subject.emit("new", conf);
        this.dispose();
    }
    static get PrefabStr(): string {
        return PrefabStr;
    }
}