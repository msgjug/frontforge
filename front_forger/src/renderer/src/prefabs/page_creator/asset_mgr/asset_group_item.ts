import { AppNode } from "../../../core/app_node";
import Prefab from "../../../core/prefab";
import { RegClass } from "../../../core/serialize";
import EditorEnv from "../../../env";
import { ProtocolObjectPrefabConfig } from "../../../../../classes/protocol_dist";
import PrefabStr from "./asset_group_item.prefab.html?raw"
import AssetItem from "./asset_item";

@RegClass("AssetGroupItem")
export default class AssetGroupItem extends AppNode {
    lbName: HTMLDivElement = null;
    contain: HTMLDivElement = null;
    itemCol: { [key: string]: AssetItem } = {};
    dragable = true;
    btnFold: HTMLButtonElement = null;
    groupName = ""

    lbItemCount: HTMLDivElement = null;
    itemCount = 0;

    foldded = false;

    setData(groupName: string) {
        this.groupName = groupName;
        this.lbName.innerText = groupName;
    }

    onLoad(): void {
        this.ele.ondragenter = (ev) => {
            if (!this.dragable) {
                return;
            }
            this.ele.setAttribute("drag-over", "");
        };
        this.ele.ondragleave = (ev) => {
            if (!this.dragable) {
                return;
            }
            // this.ele.removeAttribute("drag-over");
        };
        this.ele.ondragover = (ev) => {
            if (!this.dragable) {
                return;
            }
            this.ele.removeAttribute("drag-over");
            ev.preventDefault();
        };
    }
    addFileAssetItem(name: string, path: string) {
        let item = Prefab.Instantiate(AssetItem);
        item.setFileData(name, path);
        this.itemCol[name] = item;
        this.addChild(item, this.contain);
        item.subject.on("dispose", this.onItemDispose, this);
        item.subject.on("click", this.onClickItem, this);
        this.itemCount++;
        this.lbItemCount.innerText = `${this.itemCount}`;
        return item;
    }
    addPrefabAssetItem(prefabConfig: ProtocolObjectPrefabConfig) {
        let item = Prefab.Instantiate(AssetItem);
        item.setPrefabData(prefabConfig);
        this.itemCol[prefabConfig.name] = item;
        this.addChild(item, this.contain);
        item.subject.on("dispose", this.onItemDispose, this);
        item.subject.on("click", this.onClickItem, this);
        item.subject.on("desc-changed", this.onEditDesc, this);
        this.itemCount++;
        this.lbItemCount.innerText = `${this.itemCount}`;
        return item;
    }
    onItemDispose(item: AssetItem) {
        for (let key in this.itemCol) {
            if (this.itemCol[key] === item) {
                delete this.itemCol[key];
                this.itemCount--;
                this.lbItemCount.innerText = `${this.itemCount}`;
                break;
            }
        }
    }
    onClickItem(item: AssetItem) {
        this.subject.emit("click-item", item);
    }
    onEditDesc(item: AssetItem) {
        this.subject.emit("item-desc-changed", item);
    }
    unfold() {
        if (!this.foldded) {
            return;
        }
        this.foldded = false;
        this.contain.style.height = `calc( (1px + 23px) * ${this.itemCount})`;
        this.contain.style.padding = "0 0 0.5em 0";
        // this.contain.style.display = "";
        this.btnFold.innerText = "-";
    }
    fold() {
        if (this.foldded) {
            return;
        }
        this.foldded = true;
        this.contain.style.height = "0px";
        this.contain.style.padding = "0";
        // this.contain.style.display = "none";
        this.btnFold.innerText = "+";
    }
    onToggleFold() {
        if (this.foldded) {
            this.unfold();
        }
        else {
            this.fold();
        }
    }
    onItemDrop(evt, g2) {
        console.log(evt, g2);
        var prefabName = evt.dataTransfer.getData("Text");
        //创建一个item
        let projConf = EditorEnv.GetProjectConfig();
        let prefabConf = projConf.prefabs_list.find(ele => ele.name === prefabName);
        if (prefabConf.group !== this.groupName) {
            prefabConf.group = this.groupName;
            this.addPrefabAssetItem(prefabConf);
        }
    }
    static get PrefabStr(): string {
        return PrefabStr;
    }
}