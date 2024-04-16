import { AppNode, property } from "../../core/app_node";
import Prefab from "../../core/prefab";
import { RegClass } from "../../core/serialize";
import PrefabStr from "./page_creator.prefab.html?raw"
import Utils from "../../core/utils";
import { ProtocolObjectProjectConfig } from "../../protocol_dist";
import BoxProject from "../box_project/box_project";
import EditorEnv from "../../env";
import { DirentHandle } from "../../../../classes/dirent_handle";
import AssetMgr from "./asset_mgr/asset_mgr";
import CreatorMain from "./creator_main/creator_main";
import AssetItem from "./asset_mgr/asset_item";

export class CallMethod {
  method = "";
  args: any[] = [];
};

@RegClass("PageCreator")
export default class PageCreator extends AppNode {
  direntHandle: DirentHandle = null;
  assetMgr: AssetMgr = null;
  creatorMain: CreatorMain = null;
  onLoad(): void {
    let panel = Prefab.Instantiate(BoxProject);
    Utils.scene.addChild(panel);
    panel.subject.on("open", this.onOpenProject, this);

    this.assetMgr.subject.on("select-item", this.onSelectAssetItem, this);
  }
  onSelectAssetItem(item: AssetItem) {
    if (!item) {
      this.creatorMain.setData(null, null, null);
    }
    else {
      let dhTs = this.assetMgr.getDirentHandleByName(item.prefabConfig.name + ".ts");
      let dhDom = this.assetMgr.getDirentHandleByName(item.prefabConfig.name + ".prefab.html");
      this.creatorMain.setData(item.prefabConfig, dhTs, dhDom);
    }
  }
  async onOpenProject(config: ProtocolObjectProjectConfig) {
    await EditorEnv.InitProjectConfig(config.path);
    this.assetMgr.listDir();
  }

  static get PrefabStr(): string {
    return PrefabStr;
  }
};