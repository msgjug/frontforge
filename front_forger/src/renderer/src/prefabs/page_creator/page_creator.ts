import { AppNode, property } from "../../core/app_node";
import Prefab from "../../core/prefab";
import { RegClass } from "../../core/serialize";
import PrefabStr from "./page_creator.prefab.html?raw"
import Utils, { Sync } from "../../core/utils";
import { ProtocolObjectPrefabConfig, ProtocolObjectProjectConfig } from "../../protocol_dist";
import BoxProject from "../box_project/box_project";
import EditorEnv from "../../env";
import { DirentHandle } from "../../../../classes/dirent_handle";
import AssetMgr from "./asset_mgr/asset_mgr";
import CreatorMain from "./creator_main/creator_main";
import AssetItem from "./asset_mgr/asset_item";
import MsgHub from "../../core/subject";
import BoxProjectSetting from "./box_project_setting/box_project_setting";

export class CallMethod {
  method = "";
  args: any[] = [];
};

@RegClass("PageCreator")
export default class PageCreator extends AppNode {
  direntHandle: DirentHandle = null;
  assetMgr: AssetMgr = null;
  creatorMain: CreatorMain = null;
  createMainWrap: HTMLDivElement = null;
  topArea: HTMLDivElement = null;

  btnRun: HTMLButtonElement = null;
  btnStop: HTMLButtonElement = null;

  lbInfo: HTMLDivElement = null;
  pb: HTMLProgressElement = null;

  waitForIp = false;
  onLoad(): void {
    let panel = Prefab.Instantiate(BoxProject);
    Utils.scene.addChild(panel);
    panel.subject.on("open", this.onOpenProject, this);

    this.assetMgr.subject.on("select-item", this.onSelectAssetItem, this);

    this.creatorMain.subject.on("save", this.onClickSave, this);
    this.creatorMain.subject.on("set-start", this.onClickSetStart, this);
    this.creatorMain.subject.on("delete", this.onClickDelete, this);
    window.electron.ipcRenderer.on("hot-key", this.onHotkey.bind(this));
    window.electron.ipcRenderer.on("log", this.onIPCLog.bind(this));

    this.refreshSizeMode();
  }
  onIPCLog(_, deltaStr: string) {
    console.log("-log:", deltaStr);
    MsgHub.emit("log", deltaStr);

    if (this.waitForIp) {
    }
  }
  onHotkey(_, tag: string) {
    MsgHub.emit("hot-key", tag);
    switch (tag) {
      case "run":
        this.onClickRun();
        break;
    }
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
  async onClickDelete() {
    let projConf = EditorEnv.GetProjectConfig();
    let tsPath = projConf.path + "/src/prefabs/" + this.creatorMain.conf.name + ".ts";
    let domPath = projConf.path + "/src/prefabs/" + this.creatorMain.conf.name + ".prefab.html";

    await window.electron.ipcRenderer.invoke("FF:DeleteFile", tsPath);
    await window.electron.ipcRenderer.invoke("FF:DeleteFile", domPath);

    this.assetMgr.deleteAsset(this.creatorMain.conf);
  }
  async onClickSave() {
    let tsStr = this.creatorMain.aceList[0].getValue();
    let domStr = this.creatorMain.aceList[1].getValue();
    let projConf = EditorEnv.GetProjectConfig();
    let tsPath = projConf.path + "/src/prefabs/" + this.creatorMain.conf.name + ".ts";
    let domPath = projConf.path + "/src/prefabs/" + this.creatorMain.conf.name + ".prefab.html";
    await window.electron.ipcRenderer.invoke("FF:SaveStrFile", tsPath, tsStr);
    await window.electron.ipcRenderer.invoke("FF:SaveStrFile", domPath, domStr);
  }
  async onOpenProject(config: ProtocolObjectProjectConfig) {
    await EditorEnv.InitProjectConfig(config.path);
    await this.assetMgr.listDir();
  }

  async onClickSetStart(config: ProtocolObjectPrefabConfig) {
    let projConf = EditorEnv.GetProjectConfig();
    projConf.entrance_prefab_name = config.name;
    EditorEnv.SetProjectConfig(projConf);
    this.assetMgr.setStartAsset(config);
  }

  async onClickRun() {
    let projConf = EditorEnv.GetProjectConfig();
    let port = await window.electron.ipcRenderer.invoke("FF:RunProject", projConf.toMixed());

    this.btnRun.style.display = "none";
    this.btnStop.style.display = "";

    this.lbInfo.innerText = "运行中...";
    this.pb.style.display = "";
    let value = 0;
    this.pb.value = value * 100;
    await Sync.DelayTime(0.3);
    value += 0.3;
    this.pb.value = value * 100;
    await Sync.DelayTime(0.3);
    value += 0.3;
    this.pb.value = value * 100;
    await Sync.DelayTime(0.4);
    value += 0.4;
    this.pb.value = value * 100;
    await Sync.DelayTime(0.5);
    this.pb.style.display = "none";
    this.lbInfo.innerText = `http://localhost:${port}`;

    // port
    await window.electron.ipcRenderer.invoke("FF:OpenURL", `http://localhost:${port}`);
  }
  async onClickStop() {
    await window.electron.ipcRenderer.invoke("FF:StopProject");

    this.btnRun.style.display = "";
    this.btnStop.style.display = "none";

    this.lbInfo.innerText = `已停止预览`;
  }
  async onClickBuild() {
  }
  async onClickSetup() {
    Utils.scene.addChild(Prefab.Instantiate(BoxProjectSetting));
  }
  async onClickOpenProjectDir() {
    let projConf = EditorEnv.GetProjectConfig();
    await window.electron.ipcRenderer.invoke("FF:OpenDir", projConf.path);
  }
  async onClickCloseProject() {
    EditorEnv.SetProjectConfig(null);
    Utils.scene.replacePage(Prefab.Instantiate(PageCreator));
  }
  onClickMin() {
    EditorEnv.sizeMode = "min";
    this.refreshSizeMode();
  }
  onClickNormal() {
    EditorEnv.sizeMode = "nor";
    this.refreshSizeMode();
  }
  async refreshSizeMode() {
    switch (EditorEnv.sizeMode) {
      case "nor":
        this.createMainWrap.style.display = "";
        this.topArea.style.flexDirection = "";
        await window.electron.ipcRenderer.invoke("FF:ResizeWindow", 1000, 800);
        break;
      case "min":
        this.createMainWrap.style.display = "none";
        this.topArea.style.flexDirection = "column";
        await window.electron.ipcRenderer.invoke("FF:ResizeWindow", 300, 800);
        break;
    }
  }
  static get PrefabStr(): string {
    return PrefabStr;
  }
};