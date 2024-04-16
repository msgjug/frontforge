import { AppNode } from "../../../core/app_node";
import Prefab from "../../../core/prefab";
import { RegClass } from "../../../core/serialize";
import { ProtocolObjectPrefabConfig } from "../../../protocol_dist";
import PrefabStr from "./asset_group_item.prefab.html?raw"
import AssetItem from "./asset_item";

@RegClass("AssetGroupItem")
export default class AssetGroupItem extends AppNode {
    lbName: HTMLDivElement = null;
    contain: HTMLDivElement = null;
    itemCol: { [key: string]: AssetItem } = {};
    
    addPrefabAsset(prefabConfig: ProtocolObjectPrefabConfig) {
        let item = Prefab.Instantiate(AssetItem);
        item.setData(prefabConfig);
        this.itemCol[prefabConfig.name] = item;
        this.addChild(item, this.contain);
    }
    static get PrefabStr(): string {
        return PrefabStr;
    }
}