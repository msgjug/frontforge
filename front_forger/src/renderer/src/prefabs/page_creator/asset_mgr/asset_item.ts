import { AppNode } from "../../../core/app_node";
import { RegClass } from "../../../core/serialize";
import EditorEnv from "../../../env";
import { ProtocolObjectPrefabConfig } from "../../../../../classes/protocol_dist";
import PrefabStr from "./asset_item.prefab.html?raw"

@RegClass("AssetItem")
export default class AssetItem extends AppNode {
    lbName: HTMLDivElement = null;
    btnRoot: HTMLDivElement = null;
    iconStart: HTMLDivElement = null;
    iconPersist: HTMLDivElement = null;
    prefabConfig: ProtocolObjectPrefabConfig = null;

    imgIcon: HTMLImageElement = null;

    isPrefab = false;
    isDragable = true;

    fileName = "";
    filePath = "";

    onLoad(): void {
        this.ele.ondragstart = (ev) => {
            if (this.isDragable) {
                ev.dataTransfer.setData("Text", this.prefabConfig.name);
            }
        }
        if (this.isDragable && this.isPrefab) {
            let oldGroup = this.prefabConfig.group;
            this.ele.ondragend = async (ev) => {
                if (this.prefabConfig.group !== oldGroup) {
                    let projConf = EditorEnv.GetProjectConfig();
                    EditorEnv.SetProjectConfig(projConf);
                    this.dispose();
                }
            }
        }
    }
    onDispose(): void {
        this.subject.emit("dispose", this);
    }
    setFileData(name: string, path: string) {
        this.isPrefab = false;
        this.imgIcon.src = "icon-file.png";
        this.fileName = name;
        this.filePath = path;
        this.lbName.innerText = this.fileName;
        this.iconPersist.style.display = "none"
    }
    setPrefabData(prefabConfig: ProtocolObjectPrefabConfig) {
        this.isPrefab = true;
        this.imgIcon.src = "icon-prefab.png";
        this.prefabConfig = prefabConfig;
        this.lbName.innerText = this.prefabConfig.name;
        this.iconPersist.style.display = this.prefabConfig.is_persist ? "" : "none"
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