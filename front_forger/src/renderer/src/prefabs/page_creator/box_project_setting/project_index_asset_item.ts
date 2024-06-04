import AppNode from "../../../core/app_node";
import { RegClass } from "../../../core/serialize";
import PrefabStr from "./project_index_asset_item.prefab.html?raw"
//index.html head 引入的资源
@RegClass("ProjectIndexAssetItem")
export default class ProjectIndexAssetItem extends AppNode {
    eb: HTMLInputElement = null;

    onEdit() {
        this.subject.emit("edit", this);
    }
    onClickDel() {
        this.subject.emit("del", this);
    }

    static get PrefabStr() {
        return PrefabStr;
    }
};