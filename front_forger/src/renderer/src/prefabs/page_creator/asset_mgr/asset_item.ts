import { AppNode } from "../../../core/app_node";
import { RegClass } from "../../../core/serialize";
import { ProtocolObjectPrefabConfig } from "../../../protocol_dist";
import PrefabStr from "./asset_item.prefab.html?raw"

@RegClass("AssetItem")
export default class AssetItem extends AppNode {
    lbName: HTMLDivElement = null;
    prefabConfig: ProtocolObjectPrefabConfig = null;
    setData(prefabConfig: ProtocolObjectPrefabConfig) {
        this.prefabConfig = prefabConfig;
        this.lbName.innerText = this.prefabConfig.name;
    }

    static get PrefabStr(): string {
        return PrefabStr;
    }
}