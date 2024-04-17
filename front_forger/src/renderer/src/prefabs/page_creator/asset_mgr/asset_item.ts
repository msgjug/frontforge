import { AppNode } from "../../../core/app_node";
import { RegClass } from "../../../core/serialize";
import EditorEnv from "../../../env";
import { ProtocolObjectPrefabConfig } from "../../../protocol_dist";
import PrefabStr from "./asset_item.prefab.html?raw"

@RegClass("AssetItem")
export default class AssetItem extends AppNode {
    lbName: HTMLDivElement = null;
    btnRoot: HTMLDivElement = null;
    iconStart: HTMLDivElement = null;
    prefabConfig: ProtocolObjectPrefabConfig = null;
    onLoad(): void {
        this.ele.ondragstart = (ev) => {
            ev.dataTransfer.setData("Text", this.prefabConfig.name);
        }
        let oldGroup = this.prefabConfig.group;
        this.ele.ondragend = async (ev) => {
            if (this.prefabConfig.group !== oldGroup) {
                let projConf = EditorEnv.GetProjectConfig();
                EditorEnv.SetProjectConfig(projConf);
                this.dispose();
            }
        }
    }
    onDispose(): void {
        this.subject.emit("dispose", this);
    }
    setData(prefabConfig: ProtocolObjectPrefabConfig) {
        this.prefabConfig = prefabConfig;
        this.lbName.innerText = this.prefabConfig.name;
    }
    blur() {
        this.ele.removeAttribute("cur");
        // this.btnRoot.style.display = "none";
    }
    focus() {
        this.ele.setAttribute("cur", "");
        // this.btnRoot.style.display = "inherit";
    }

    setStart() {
        this.ele.setAttribute("start", "");
        this.iconStart.style.display = "inherit";
    }
    unsetStart() {
        this.ele.removeAttribute("start");
        this.iconStart.style.display = "none";
    }
    onClick() {
        this.subject.emit("click", this);
    }
    onClickSave() {
        this.subject.emit("save", this);
    }
    onClickSetStart() {
        this.subject.emit("set-start", this);
    }
    onClickDelete() {
        this.subject.emit("delete", this);
    }
    static get PrefabStr(): string {
        return PrefabStr;
    }
}