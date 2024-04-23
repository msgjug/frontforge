import { AppNode } from "../../core/app_node";
import Prefab from "../../core/prefab";
import { RegClass } from "../../core/serialize";
import PrefabStr from "./page_creator.prefab.html?raw"
import Utils, { Sync } from "../../core/utils";
import { Protocol, ProtocolObjectCloseProject, ProtocolObjectDeletePrefab, ProtocolObjectFlagPrefab, ProtocolObjectOpenProject, ProtocolObjectSavePrefab, ProtocolObjectSelectPrefab, ProtocolObjectWindowChange } from "../../../../classes/protocol_dist";
import EditorEnv from "../../env";
import { DirentHandle } from "../../../../classes/dirent_handle";
import AssetMgr from "./asset_mgr/asset_mgr";
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
  topArea: HTMLDivElement = null;

  btnRun: HTMLButtonElement = null;
  btnStop: HTMLButtonElement = null;

  lbInfo: HTMLDivElement = null;
  pb: HTMLProgressElement = null;

  //代码编辑器开关
  toggleCode: HTMLButtonElement = null;

  waitForIp = false;
  async onLoad() {
    EditorEnv.onMessage(this.onMessage, this);

    window.electron.ipcRenderer.invoke("FF:CreateWindow", "box_project", 0, 0, 400, 400, "none", "BoxProject", true);

    this.assetMgr.subject.on("select-item", this.onSelectAssetItem, this);

    window.electron.ipcRenderer.on("hot-key", this.onHotkey.bind(this));
    window.electron.ipcRenderer.on("log", this.onIPCLog.bind(this));

  }
  onDispose(): void {
    EditorEnv.offMessage(this);
  }
  async onMessage(msg: Protocol) {
    switch (true) {
      case msg instanceof ProtocolObjectOpenProject:
        this.onOpenProject(msg);
        break;
      case msg instanceof ProtocolObjectCloseProject:
        break;

      case msg instanceof ProtocolObjectSavePrefab:
        this.onPrefabSave(msg);
        break;
      case msg instanceof ProtocolObjectDeletePrefab:
        this.onPrefabDelete(msg);
        break;
      case msg instanceof ProtocolObjectFlagPrefab:
        this.onFlagPrefab(msg);
        break;
      case msg instanceof ProtocolObjectWindowChange:
        {
          let conf = await EditorEnv.GetEditorConfig();
          if (msg.close === "code") {
            if (conf.win_code) {
              conf.win_code = false;
              if (conf.win_code) {
                this.toggleCode.setAttribute("pressed", "");
              }
              else {
                this.toggleCode.removeAttribute("pressed");
              }
              await EditorEnv.SaveEditorConfig();
            }
          }
        }
        break;
    }
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
    let msg = new ProtocolObjectSelectPrefab();
    if (item) {
      let dhTs = this.assetMgr.getDirentHandleByName(item.prefabConfig.name + ".ts");
      let dhDom = this.assetMgr.getDirentHandleByName(item.prefabConfig.name + ".prefab.html");
      msg.valid = true;
      msg.ts_str = dhTs.dataStr;
      msg.dom_str = dhDom.dataStr;
      msg.prefab_conf = item.prefabConfig;
    }
    EditorEnv.postMessage(msg);
  }
  async onPrefabDelete(msg: ProtocolObjectDeletePrefab) {
    let projConf = EditorEnv.GetProjectConfig();
    let tsPath = projConf.path + "/src/prefabs/" + msg.prefab_conf.name + ".ts";
    let domPath = projConf.path + "/src/prefabs/" + msg.prefab_conf.name + ".prefab.html";

    await window.electron.ipcRenderer.invoke("FF:DeleteFile", tsPath);
    await window.electron.ipcRenderer.invoke("FF:DeleteFile", domPath);

    this.assetMgr.deleteAsset(msg.prefab_conf);
  }
  async onPrefabSave(msg: ProtocolObjectSavePrefab) {
    let projConf = EditorEnv.GetProjectConfig();
    let tsPath = projConf.path + "/src/prefabs/" + msg.prefab_conf.name + ".ts";
    let domPath = projConf.path + "/src/prefabs/" + msg.prefab_conf.name + ".prefab.html";
    await window.electron.ipcRenderer.invoke("FF:SaveStrFile", tsPath, msg.ts_str);
    await window.electron.ipcRenderer.invoke("FF:SaveStrFile", domPath, msg.dom_str);

    if (!msg.silent) {
      Utils.scene.toast(`保存成功${Utils.TimestampToTime(Date.now())}`);
    }
  }

  async onFlagPrefab(msg: ProtocolObjectFlagPrefab) {
    let projConf = EditorEnv.GetProjectConfig();
    projConf.entrance_prefab_name = msg.prefab_conf.name;
    EditorEnv.SetProjectConfig(projConf);
    this.assetMgr.setStartAsset(msg.prefab_conf);
  }

  async onOpenProject(msg: ProtocolObjectOpenProject) {
    await EditorEnv.InitProjectConfig(msg.project_conf.path);
    await this.assetMgr.listDir();
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
    let msg = new ProtocolObjectCloseProject();
    msg.project_conf = EditorEnv.GetProjectConfig();
    EditorEnv.postMessage(msg);

    EditorEnv.SetProjectConfig(null);
    Utils.scene.replacePage(Prefab.Instantiate(PageCreator));
  }
  async onClickToggleCodeEditor() {
    let conf = await EditorEnv.GetEditorConfig();
    conf.win_code = !conf.win_code;

    if (conf.win_code) {
      this.toggleCode.setAttribute("pressed", "");
    }
    else {
      this.toggleCode.removeAttribute("pressed");
    }

    await window.electron.ipcRenderer.invoke("FF:SaveEditorConfig", conf.toMixed());
  }
  static get PrefabStr(): string {
    return PrefabStr;
  }
};