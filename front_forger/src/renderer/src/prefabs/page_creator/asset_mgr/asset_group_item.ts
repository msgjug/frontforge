import { AppNode } from "../../../core/app_node";
import Prefab from "../../../core/prefab";
import { RegClass } from "../../../core/serialize";
import EditorEnv from "../../../env";
import { ProtocolObjectPrefabConfig } from "../../../protocol_dist";
import PrefabStr from "./asset_group_item.prefab.html?raw"
import AssetItem from "./asset_item";

@RegClass("AssetGroupItem")
export default class AssetGroupItem extends AppNode {
    lbName: HTMLDivElement = null;
    contain: HTMLDivElement = null;
    itemCol: { [key: string]: AssetItem } = {};

    btnFold: HTMLButtonElement = null;
    groupName = ""
    setData(groupName: string) {
        this.groupName = groupName;
        this.lbName.innerText = groupName;
    }

    onLoad(): void {
        this.ele.ondragenter = (ev) => {
            this.ele.setAttribute("drag-over", "");
        };
        this.ele.ondragleave = (ev) => {
            // this.ele.removeAttribute("drag-over");
        };
        this.ele.ondragover = (ev) => {
            this.ele.removeAttribute("drag-over");
            ev.preventDefault();
        };
    }
    addAssetItem(prefabConfig: ProtocolObjectPrefabConfig) {
        let item = Prefab.Instantiate(AssetItem);
        item.setData(prefabConfig);
        this.itemCol[prefabConfig.name] = item;
        this.addChild(item, this.contain);
        item.subject.on("dispose", this.onItemDispose, this);
        item.subject.on("click", this.onClickItem, this);
        return item;
    }
    onItemDispose(item: AssetItem) {
        for (let key in this.itemCol) {
            if (this.itemCol[key] === item) {
                delete this.itemCol[key];
                break;
            }
        }
    }
    onClickItem(item: AssetItem) {
        this.subject.emit("click-item", item);
    }
    unfold() {
        this.contain.style.display = "";
        this.btnFold.innerText = "-";
    }
    fold() {
        this.contain.style.display = "none";
        this.btnFold.innerText = "+";
    }
    onToggleFold() {
        if (this.contain.style.display === "none") {
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
            this.addAssetItem(prefabConf);
        }
    }
    static get PrefabStr(): string {
        return PrefabStr;
    }
}