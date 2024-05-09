import { AppNode } from "../../core/app_node";
import Prefab from "../../core/prefab";
import { RegClass } from "../../core/serialize";
import PrefabStr from "./page_creator.prefab.html?raw"
import Utils, { Sync } from "../../core/utils";
import { Protocol, ProtocolObjectCloseProject, ProtocolObjectDeletePrefab, ProtocolObjectFlagPrefab, ProtocolObjectOpenFile, ProtocolObjectOpenProject, ProtocolObjectPrefabConfig, ProtocolObjectSaveFile, ProtocolObjectSavePrefab, ProtocolObjectSelectPrefab, ProtocolObjectWindowChange } from "../../../../classes/protocol_dist";
import EditorEnv from "../../env";
import { DirentHandle } from "../../../../classes/dirent_handle";
import AssetMgr from "./asset_mgr/asset_mgr";
import AssetItem from "./asset_mgr/asset_item";
import MsgHub from "../../core/subject";
import BoxProjectSetting from "./box_project_setting/box_project_setting";
import Macro from "../../core/macro";

export class CallMethod {
  method = "";
  args: any[] = [];
};

const EXT_MODE = {
  "md": "markdown",
  "css": "css",
  "ts": "typescript",
  "js": "javascript",
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

  //设计器开关
  toggleDesigner: HTMLButtonElement = null;

  waitForIp = false;
  async onLoad() {
    EditorEnv.onMessage(this.onMessage, this);

    Utils.app.blocker.ref++;
    window.electron.ipcRenderer.invoke("FF:CreateWindow", "box_project", 0, 0, 400, 400, "none", "BoxProject", "main");

    this.assetMgr.subject.on("select-item", this.onSelectAssetItem, this);
    this.assetMgr.subject.on("open-file", this.onOpenFile, this);

    MsgHub.on("hot-key", this.onHotKey, this);
  }
  onDispose(): void {
    EditorEnv.offMessage(this);
    MsgHub.targetOff(this);
    window.electron.ipcRenderer.invoke("FF:StopProject", Macro.PROJECT_VIEW_PORT);
  }
  onHotKey(tag) {
    switch (tag) {
      case "run":
        this.onClickRun();
        break;
    }
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

      case msg instanceof ProtocolObjectSaveFile:
        this.onFileSave(msg);
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

          if (msg.close === "designer") {
            if (conf.win_designer) {
              conf.win_designer = false;
              if (conf.win_designer) {
                this.toggleDesigner.setAttribute("pressed", "");
              }
              else {
                this.toggleDesigner.removeAttribute("pressed");
              }
              await EditorEnv.SaveEditorConfig();
            }
          }
          if (msg.open === "designer") {
            //当前选择项目
            if (conf.win_designer) {
              let msg = new ProtocolObjectOpenProject();
              msg.project_conf = EditorEnv.GetProjectConfig();
              EditorEnv.postMessageTo(msg, ["designer"]);
            }
          }
        }
        break;
    }
  }
  async onOpenFile(path: string) {
    let msg = new ProtocolObjectOpenFile();
    msg.path = path;
    msg.str = await window.electron.ipcRenderer.invoke("FF:ReadStrFile", msg.path);
    msg.mode = EXT_MODE[msg.path.substring(msg.path.lastIndexOf(".") + 1)] || "text";
    EditorEnv.postMessageExceptSelf(msg);
  }
  static GetPath(prefabConfig: ProtocolObjectPrefabConfig) {
    return prefabConfig.path || "/src/prefabs/";
  }
  async onSelectAssetItem(item: AssetItem) {
    let msg = new ProtocolObjectSelectPrefab();
    if (!item) {
      EditorEnv.postMessageExceptSelf(msg);
    }
    let projConf = EditorEnv.GetProjectConfig();
    if (item.isPrefab) {
      //获取dh
      let tsPath = projConf.path + PageCreator.GetPath(item.prefabConfig) + item.prefabConfig.name + ".ts";
      let domPath = projConf.path + PageCreator.GetPath(item.prefabConfig) + item.prefabConfig.name + ".prefab.html";
      let dhTs = await window.electron.ipcRenderer.invoke("FF:GetDirentHandle", tsPath);
      let dhDom = await window.electron.ipcRenderer.invoke("FF:GetDirentHandle", domPath);
      msg.valid = true;
      msg.ts_str = dhTs.dataStr;
      msg.dom_str = dhDom.dataStr;
      msg.prefab_conf = item.prefabConfig;
      EditorEnv.postMessageExceptSelf(msg);
    }
    else {
      this.onOpenFile(projConf.path + item.filePath);
    }
  }
  async onPrefabDelete(msg: ProtocolObjectDeletePrefab) {
    let projConf = EditorEnv.GetProjectConfig();
    let tsPath = projConf.path + PageCreator.GetPath(msg.prefab_conf) + msg.prefab_conf.name + ".ts";
    let domPath = projConf.path + PageCreator.GetPath(msg.prefab_conf) + msg.prefab_conf.name + ".prefab.html";

    await window.electron.ipcRenderer.invoke("FF:DeleteFile", tsPath);
    await window.electron.ipcRenderer.invoke("FF:DeleteFile", domPath);

    this.assetMgr.deleteAsset(msg.prefab_conf);
  }
  async onPrefabSave(msg: ProtocolObjectSavePrefab) {
    let projConf = EditorEnv.GetProjectConfig();
    let tsPath = projConf.path + PageCreator.GetPath(msg.prefab_conf) + msg.prefab_conf.name + ".ts";
    let domPath = projConf.path + PageCreator.GetPath(msg.prefab_conf) + msg.prefab_conf.name + ".prefab.html";
    await window.electron.ipcRenderer.invoke("FF:SaveStrFile", tsPath, msg.ts_str);
    await window.electron.ipcRenderer.invoke("FF:SaveStrFile", domPath, msg.dom_str);

    ///更新资源管理器里的资源

    this.assetMgr.updateAsset(msg.prefab_conf.name, msg.ts_str, msg.dom_str);

    if (!msg.silent) {
      Utils.scene.toast(`保存成功${Utils.TimestampToTime(Date.now())}`);
    }
  }

  async onFileSave(msg: ProtocolObjectSaveFile) {
    await window.electron.ipcRenderer.invoke("FF:SaveStrFile", msg.path, msg.str);
    if (!msg.silent) {
      Utils.scene.toast(`${msg.path}保存成功${Utils.TimestampToTime(Date.now())}`);
    }
  }

  async onFlagPrefab(msg: ProtocolObjectFlagPrefab) {
    let projConf = EditorEnv.GetProjectConfig();
    projConf.entrance_prefab_name = msg.prefab_conf.name;
    EditorEnv.SetProjectConfig(projConf);
    this.assetMgr.setStartAsset(msg.prefab_conf);
  }

  async onOpenProject(msg: ProtocolObjectOpenProject) {
    if ((await window.electron.ipcRenderer.invoke("FF:CheckProjectDir", msg.project_conf.path)).ret === 1) {
      window.electron.ipcRenderer.invoke("FF:MsgBox", "项目文件夹无效");
      this.exit();
      return;
    }
    await EditorEnv.InitProjectConfig(msg.project_conf.path);
    await this.assetMgr.listDir();
    await this.runProjectDev();
  }

  async onClickRun() {
    let projConf = EditorEnv.GetProjectConfig();
    if (!projConf.entrance_prefab_name) {
      Utils.app.msgBox("请设置入口");
      return;
    }
    this._runPort = await this.runProject("");

    this.btnRun.style.display = "none";
    this.btnStop.style.display = "";

    this.lbInfo.innerText = "运行中...";

    this.pb.style.display = "";
    this.pb.max = 100;
    this.pb.value = 0;
    let step = 15;
    let delayTime = 2;
    let stepTime = delayTime / 15;
    while (step > 0) {
      this.pb.value += 100 * (1 / 15);
      await Sync.DelayTime(stepTime);
      step--;
    }

    this.pb.value = 100;
    this.pb.style.display = "none";


    this.lbInfo.innerText = `http://localhost:${this._runPort}`;

    // port
    await window.electron.ipcRenderer.invoke("FF:OpenURL", `http://localhost:${this._runPort}`);
  }
  async runProject(port: string) {
    let projConf = EditorEnv.GetProjectConfig();
    port = await window.electron.ipcRenderer.invoke("FF:RunProject", projConf.toMixed(), port);
    return port;
  }
  runProjectDev() {
    return this.runProject(Macro.PROJECT_VIEW_PORT)
  }
  protected _runPort = ""; //手动运行预览

  async onClickStop() {
    await window.electron.ipcRenderer.invoke("FF:StopProject", this._runPort);
    this._runPort = "";

    this.btnRun.style.display = "";
    this.btnStop.style.display = "none";

    this.lbInfo.innerText = `已停止预览`;
  }
  isBuilding = false;
  async onClickBuild() {
    if (this.isBuilding) {
      Utils.app.msgBox("正在构建");
      return;
    }
    let projConf = EditorEnv.GetProjectConfig();
    if (!projConf.entrance_prefab_name) {
      Utils.app.msgBox("请设置入口");
      return;
    }
    this.isBuilding = true;
    this.lbInfo.innerText = "构建中...";

    this.pb.style.display = "";
    this.pb.value = 0;
    this.pb.max = 0;
    await window.electron.ipcRenderer.invoke("FF:BuildProject", projConf.toMixed());

    this.pb.style.display = "none";
    this.lbInfo.innerText = `构建完毕`;
    this.isBuilding = false;
    await window.electron.ipcRenderer.invoke("FF:OpenDir", projConf.path + "dist");
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

    this.exit();
  }
  exit() {
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
    await EditorEnv.SaveEditorConfig();
  }
  async onClickToggleHTMLDesigner() {
    let conf = await EditorEnv.GetEditorConfig();
    conf.win_designer = !conf.win_designer;

    if (conf.win_designer) {
      this.toggleDesigner.setAttribute("pressed", "");
    }
    else {
      this.toggleDesigner.removeAttribute("pressed");
    }
    await EditorEnv.SaveEditorConfig();
  }

  async onClickHelp() {

    window.electron.ipcRenderer.invoke("FF:CreateWindow", "box_help", 0, 0, 400, 400, "none", "BoxHelp", "", "main");
  }
  static get PrefabStr(): string {
    return PrefabStr;
  }


};