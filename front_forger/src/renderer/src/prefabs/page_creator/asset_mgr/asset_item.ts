import AppNode from "../../../core/app_node";
import { RegClass } from "../../../core/serialize";
import EditorEnv from "../../../env";
import { ProtocolObjectPrefabConfig } from "../../../../../classes/protocol_dist";
import PrefabStr from "./asset_item.prefab.html?raw"

@RegClass("AssetItem")
export default class AssetItem extends AppNode {
    prefabInfo: HTMLDivElement = null;
    assetItemDesc: HTMLDivElement = null;

    lbName: HTMLDivElement = null;
    lbDesc: HTMLDivElement = null;
    ebDesc: HTMLInputElement = null;
    btnRoot: HTMLDivElement = null;
    iconStart: HTMLDivElement = null;
    iconPersist: HTMLDivElement = null;
    prefabConfig: ProtocolObjectPrefabConfig = null;

    imgIcon: HTMLImageElement = null;

    isPrefab = false;
    isDragable = true;
    isInternal = false; //是否内置资源。

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
        this.lbDesc.innerText = "";
        this.iconPersist.style.display = "none"
    }
    setPrefabData(prefabConfig: ProtocolObjectPrefabConfig) {
        this.isPrefab = true;
        this.imgIcon.src = "icon-prefab.png";
        this.prefabConfig = prefabConfig;
        this.lbName.innerText = this.prefabConfig.name;
        this.lbDesc.innerText = this.prefabConfig.desc;
        this.iconPersist.style.display = this.prefabConfig.is_persist ? "" : "none"
        this.prefabInfo.style.display = "flex";
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

    editingDesc = false;
    onClickEditDesc() {
        this.editingDesc = !this.editingDesc;
        this.ebDesc.style.display = this.editingDesc ? "" : "none";
        this.lbDesc.style.display = this.editingDesc ? "none" : "";

        this.assetItemDesc.style.display = this.editingDesc ? "flex" : ""

        if (!this.editingDesc) {
            this.prefabConfig.desc = this.ebDesc.value;
            this.lbDesc.innerText = this.prefabConfig.desc;
            this.subject.emit("desc-changed", this);
        }
        else {
            this.lbDesc.innerText = this.prefabConfig.desc;
            this.ebDesc.value = this.prefabConfig.desc;
        }
    }
    static get PrefabStr(): string {
        return PrefabStr;
    }
}