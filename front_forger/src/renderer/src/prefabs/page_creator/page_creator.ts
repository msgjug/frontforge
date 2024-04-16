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

export class CallMethod {
  method = "";
  args: any[] = [];
};

@RegClass("PageCreator")
export default class PageCreator extends AppNode {
  projectConfig: ProtocolObjectProjectConfig = null;
  direntHandle: DirentHandle = null;
  assetMgr: AssetMgr = null;
  onLoad(): void {
    let panel = Prefab.Instantiate(BoxProject);
    Utils.scene.addChild(panel);
    panel.subject.on("open", this.onOpenProject, this);
  }
  async onOpenProject(config: ProtocolObjectProjectConfig) {
    this.projectConfig = config;
    EditorEnv.SetProjectConfig(this.projectConfig);

    console.log(this.projectConfig);
    this.direntHandle = await window.electron.ipcRenderer.invoke("FF:ListDir", this.projectConfig.path);
  }

  static get PrefabStr(): string {
    return PrefabStr;
  }
};