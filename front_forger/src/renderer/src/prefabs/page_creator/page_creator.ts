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

    Utils.app.blocker.ref++;
    window.electron.ipcRenderer.invoke("FF:CreateWindow", "box_project", 0, 0, 400, 400, "none", "BoxProject", "main");

    this.assetMgr.subject.on("select-item", this.onSelectAssetItem, this);

    MsgHub.on("hot-key", this.onHotKey, this);
    MsgHub.on("log", this.onIPCLog, this);
  }
  onDispose(): void {
    EditorEnv.offMessage(this);
    MsgHub.targetOff(this);
  }
  onHotKey(tag) {
    switch (tag) {
      case "run":
        this.onClickRun();
        break;
    }
  }
  onIPCLog(delta) {

  }

  async onMessage(msg: Protocol) {
    switch (true) {
      case msg instanceof ProtocolObjectOpenProject:
        Utils.app.blocker.ref--;
        this.onOpenProject(msg);
        break;
      case msg instanceof ProtocolObjectCloseProject:
        Utils.app.blocker.ref++;
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
          if (msg.open === "code") {
            //当前选择的prefab数据，
            await Sync.DelayTime(0.25);
            this.onSelectAssetItem(this.assetMgr.curItem);
          }
        }
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
    EditorEnv.postMessageExceptSelf(msg);
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
    if (!projConf.entrance_prefab_name) {
      Utils.app.msgBox("请设置入口");
      return;
    }
    let port = await window.electron.ipcRenderer.invoke("FF:RunProject", projConf.toMixed());

    this.btnRun.style.display = "none";
    this.btnStop.style.display = "";

    this.lbInfo.innerText = "运行中...";

    this.pb.style.display = "";
    this.pb.value =0;
    let step = 15;
    let delayTime = 2;
    let stepTime = delayTime / 15;
    while (step > 0) {
      this.pb.value += 100* (1/15);
      await Sync.DelayTime(stepTime);
      step--;
    }

    this.pb.value = 100;
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
    EditorEnv.postMessageExceptSelf(msg);

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
  async onClickHelp() {

    window.electron.ipcRenderer.invoke("FF:CreateWindow", "box_help", 0, 0, 400, 400, "none", "BoxHelp", "", "main");
  }
  static get PrefabStr(): string {
    return PrefabStr;
  }


};