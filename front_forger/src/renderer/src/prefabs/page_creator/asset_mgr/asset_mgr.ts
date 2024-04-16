import { AppNode } from "../../../core/app_node";
import Prefab from "../../../core/prefab";
import { RegClass } from "../../../core/serialize";
import Utils from "../../../core/utils";
import { ProtocolObjectPrefabConfig } from "../../../protocol_dist";
import AssetGroupItem from "./asset_group_item";
import PrefabStr from "./asset_mgr.prefab.html?raw"
import BoxNewPrefabAsset from "./box_new_prefab_asset";

@RegClass("AssetMgr")
export default class AssetMgr extends AppNode {
  contain: HTMLDivElement = null;
  groupCol: { [key: string]: AssetGroupItem } = {};
  onLoad(): void {
  }
  onClickNewPrefab() {
    Utils.scene.addChild(Prefab.Instantiate(BoxNewPrefabAsset));
  }
  addPrefabAsset(prefabConfig: ProtocolObjectPrefabConfig) {
    let group = null;
    if (!this.groupCol[prefabConfig.group]) {
      group = this.addGroup(prefabConfig.group);
    }
    group.addAssetItem(prefabConfig);
  }
  addGroup(groupName: string) {
    let groupItem = Prefab.Instantiate(AssetGroupItem);
    groupItem.lbName.innerText = groupName;
    this.groupCol[groupName] = groupItem;
    this.addChild(groupItem, this.contain);
  }
  static get PrefabStr(): string {
    return PrefabStr;
  }
};