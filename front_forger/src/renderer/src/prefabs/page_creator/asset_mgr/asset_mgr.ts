import { DirentHandle } from "../../../../../classes/dirent_handle";
import AppNode from "../../../core/app_node";
import Prefab from "../../../core/prefab";
import { RegClass } from "../../../core/serialize";
import Utils from "../../../core/utils";
import EditorEnv from "../../../env";
import { Protocol, ProtocolObjectDeletePrefab, ProtocolObjectFlagPrefab, ProtocolObjectPersistPrefab, ProtocolObjectPrefabConfig } from "../../../../../classes/protocol_dist";
import AssetGroupItem from "./asset_group_item";
import AssetItem from "./asset_item";
import PrefabStr from "./asset_mgr.prefab.html?raw"
import BoxNewPrefabAsset from "./box_new_prefab_asset";


export const INTERNAL_ASSETS = {
  files: [
    ["项目笔记", "devnote.md"],
    ["全局CSS", "src/css/global.css"],
    "src/core/app_node.ts",
    "src/core/cache_data.ts",
    "src/core/data_ext.ts",
    "src/core/http_request.ts",
    "src/core/index.ts",
    "src/core/macro.ts",
    "src/core/prefab.ts",
    "src/core/serialize.ts",
    "src/core/subject.ts",
    "src/core/utils.ts",
    "src/core/web_application.ts",
  ],
  prefabs: [
    {
      is_persist: false,
      name: "blocker",
      path: "./src/core/prefabs/"
    },
    {
      is_persist: false,
      name: "msg_box",
      path: "./src/core/prefabs/"
    },
    {
      is_persist: false,
      name: "msgbox_yes_no",
      path: "./src/core/prefabs/"
    },
    {
      is_persist: false,
      name: "panel",
      path: "./src/core/prefabs/"
    },
    {
      is_persist: true,
      name: "scene",
      path: "./src/core/prefabs/"
    },
    {
      is_persist: false,
      name: "toast",
      path: "./src/core/prefabs/"
    },
  ]
};

@RegClass("AssetMgr")
export default class AssetMgr extends AppNode {
  contain: HTMLDivElement = null;
  groupCol: { [key: string]: AssetGroupItem } = {};
  direntHandle: DirentHandle = null;
  curItem: AssetItem = null;

  assetCtrl: HTMLDivElement = null;

  onLoad(): void {
    EditorEnv.onMessage(this.onMessage, this);
  }
  onDispose(): void {
    EditorEnv.offMessage(this);
  }
  async onMessage(msg: Protocol) {
    switch (true) {
      case msg instanceof ProtocolObjectPersistPrefab:
        let item = this.findAssetItemByAssetConfig(msg.prefab_conf);
        if (item) {
          item.setPrefabData(msg.prefab_conf);
        }
        break;
    }
  }

  findAssetItemByAssetConfig(conf: ProtocolObjectPrefabConfig) {
    for (let key in this.groupCol) {
      let group = this.groupCol[key];
      let item = group.itemCol[conf.name];
      if (item) {
        return item;
      }
    }
    return null;
  }

  async listDir() {
    let projConf = EditorEnv.GetProjectConfig();
    this.direntHandle = await window.electron.ipcRenderer.invoke("FF:ListDir", projConf.path);
    this.refresh();
  }
  refresh() {
    this.groupCol = {};
    this.disposeAllChildren(this.contain);

    //internal 资源
    let group = this.addGroup("internal");
    group.fold();
    group.dragable = false;
    group.ele.style.background = "rgba(0,0,100,0.5)";
    for (let i = 0; i < INTERNAL_ASSETS.prefabs.length; i++) {
      let conf = new ProtocolObjectPrefabConfig();
      Object.assign(conf, INTERNAL_ASSETS.prefabs[i]);
      conf.group = "internal";
      let internalItem = group.addPrefabAssetItem(conf);
      internalItem.isDragable = false;
      internalItem.isInternal = true;
      internalItem.prefabInfo.style.display = "none";
    }
    for (let i = 0; i < INTERNAL_ASSETS.files.length; i++) {
      let path = INTERNAL_ASSETS.files[i];
      let nickname = "";
      if (path instanceof Array) {
        nickname = path[0];
        path = path[1];
      }
      let internalItem = group.addFileAssetItem(nickname || Utils.GetNameByPath(path), path);
      internalItem.isDragable = false;
      internalItem.isDragable = true;
      internalItem.prefabInfo.style.display = "none";
    }

    let projConf = EditorEnv.GetProjectConfig();
    projConf.prefabs_list.forEach(conf => {
      this.addPrefabAsset(conf);
    });
    this.refreshSetStart(projConf.entrance_prefab_name);
  }
  addPrefabAsset(prefabConfig: ProtocolObjectPrefabConfig) {
    let group = this.groupCol[prefabConfig.group];
    if (!group) {
      group = this.addGroup(prefabConfig.group);
    }
    group.addPrefabAssetItem(prefabConfig);
  }
  addGroup(groupName: string) {
    let groupItem = Prefab.Instantiate(AssetGroupItem);
    groupItem.setData(groupName);
    groupItem.lbName.innerText = groupName;
    this.groupCol[groupName] = groupItem;
    this.addChild(groupItem, this.contain);
    groupItem.subject.on("click-item", this.onClickAssetItem, this);
    groupItem.subject.on("item-desc-changed", this.onItemDescChanged, this);

    return groupItem;
  }

  private __getDirentHandleByNameRec(name: string, dh: DirentHandle): DirentHandle {
    for (let i = 0; i < dh.children.length; i++) {
      let cdh = dh.children[i];
      if (cdh.name === name) {
        return dh.children[i];
      }
      if (cdh.children.length > 0) {
        let foundDh = this.__getDirentHandleByNameRec(name, cdh);
        if (foundDh) {
          return foundDh;
        }
      }
    }
    return null;
  }
  getDirentHandleByName(name: string) {
    return this.__getDirentHandleByNameRec(name, this.direntHandle);
  }

  getDirentHandleByPath(path: string) {
    let names = path.split("/");
    let dh = this.direntHandle;

    for (let i = 0; i < names.length; i++) {
      dh = dh.children.find(ele => ele.name === names[i]);
      if (!dh) {
        break;
      }
    }
    return dh;
  }

  setCurItem(item: AssetItem) {
    if (AppNode.IsValid(this.curItem)) {
      this.curItem.subject.targetOff(this);
      this.curItem.blur();
      this.curItem = null;

      this.assetCtrl.style.display = "none";
    }

    this.curItem = item;
    if (this.curItem) {
      this.assetCtrl.style.display = "";
      this.curItem.subject.on("dispose", this.onCurItemDispose, this);
      this.curItem.focus();
    }
    this.subject.emit("select-item", this.curItem);
  }
  onCurItemDispose() {
    this.setCurItem(null);
  }
  onClickAssetItem(item: AssetItem) {
    this.setCurItem(item);
  }
  onItemDescChanged(item: AssetItem) {
    let projConf = EditorEnv.GetProjectConfig();
    EditorEnv.SetProjectConfig(projConf);
  }
  onClickNewPrefab() {
    let panel = Prefab.Instantiate(BoxNewPrefabAsset);
    Utils.scene.addChild(panel);
    panel.subject.on("new", this.onNewPrefabAsset, this);
  }
  onClickFold() {
    for (let key in this.groupCol) {
      this.groupCol[key].fold();
    }
  }
  onClickUnfold() {
    for (let key in this.groupCol) {
      this.groupCol[key].unfold();
    }
  }
  async onClickRefresh() {
    let projConf = EditorEnv.GetProjectConfig();
    let oldList = projConf.prefabs_list.slice();
    let newList = [];
    this.direntHandle = await window.electron.ipcRenderer.invoke("FF:ListDir", projConf.path);
    let dh = this.getDirentHandleByPath("src/prefabs");
    for (let i = 0; i < dh.children.length; i++) {
      let cdh = dh.children[i];
      if (cdh.extName === "ts") {
        let prefabName = cdh.name.substring(0, cdh.name.indexOf("."));
        let prefabConf = oldList.find(ele => ele.name === prefabName);
        if (prefabConf) {
          newList.push(prefabConf)
        }
        else {
          prefabConf = new ProtocolObjectPrefabConfig();
          prefabConf.name = prefabName
          prefabConf.group = "prefabs";
          newList.push(prefabConf);
        }
      }
    }
    projConf.prefabs_list = newList;
    await EditorEnv.SetProjectConfig(projConf);
    this.refresh();
    this.setCurItem(null);
  }
  async onNewPrefabAsset(conf: ProtocolObjectPrefabConfig) {
    let projConf = EditorEnv.GetProjectConfig();
    projConf.prefabs_list.push(conf);
    this.addPrefabAsset(conf);

    //保存项目数据
    await EditorEnv.SetProjectConfig(projConf);

    //获取dh
    let newDh = await window.electron.ipcRenderer.invoke("FF:GetDirentHandle", projConf.path);
    //更新DH
    let dh = this.getDirentHandleByPath("src/prefabs");
    dh.children.push(newDh);
  }
  refreshSetStart(startPrefabName: string) {
    for (let gk in this.groupCol) {
      let group = this.groupCol[gk];
      for (let key in group.itemCol) {
        if (group.itemCol[key].isPrefab && group.itemCol[key].prefabConfig.name === startPrefabName) {
          group.itemCol[key].setStart();
        }
        else {
          group.itemCol[key].unsetStart();
        }
      }
    }
  }

  onClickSetPersist() {
    if (!this.curItem) {
      return;
    }
    this.curItem.prefabConfig.is_persist = !this.curItem.prefabConfig.is_persist;
    let projConf = EditorEnv.GetProjectConfig();
    EditorEnv.SetProjectConfig(projConf);

    let msg = new ProtocolObjectPersistPrefab();
    msg.prefab_conf = this.curItem.prefabConfig;
    EditorEnv.postMessage(msg);
  }
  onClickSetStart() {
    if (!this.curItem) {
      return;
    }
    let msg = new ProtocolObjectFlagPrefab();
    msg.prefab_conf = this.curItem.prefabConfig;
    EditorEnv.postMessage(msg);

  }

  async onClickDelete() {
    if (!this.curItem) {
      return;
    }
    if (!await Utils.app.msgBoxYesNo(`删除${this.curItem.prefabConfig.name}?`)) {
      return;
    }

    let msg = new ProtocolObjectDeletePrefab();
    msg.prefab_conf = this.curItem.prefabConfig;
    EditorEnv.postMessage(msg);
  }

  setStartAsset(prefabConfig: ProtocolObjectPrefabConfig) {
    this.refreshSetStart(prefabConfig.name);
  }
  deleteAsset(prefabConfig: ProtocolObjectPrefabConfig) {
    let projConf = EditorEnv.GetProjectConfig();
    let foundInd = projConf.prefabs_list.findIndex(ele => ele.name === prefabConfig.name);
    if (foundInd !== -1) {
      projConf.prefabs_list.splice(foundInd, 1);
    }

    if (this.groupCol[prefabConfig.group]) {
      let group = this.groupCol[prefabConfig.group]
      group.itemCol[prefabConfig.name] && group.itemCol[prefabConfig.name].dispose();
    }

    if (this.curItem && this.curItem.prefabConfig.name === prefabConfig.name) {
      this.setCurItem(null);
    }

    EditorEnv.SetProjectConfig(projConf);
  }
  updateAsset(prerfabName: string, tsStr: string, domStr: string) {
    this.getDirentHandleByName(prerfabName + ".ts").dataStr = tsStr;
    this.getDirentHandleByName(prerfabName + ".prefab.html").dataStr = domStr;
  }

  onClickEditCSS() {
    this.setCurItem(null);
    let projConf = EditorEnv.GetProjectConfig();
    this.subject.emit("open-file", projConf.path + "/src/css/global.css");
  }
  onClickEditDevNote() {
    this.setCurItem(null);
    let projConf = EditorEnv.GetProjectConfig();
    this.subject.emit("open-file", projConf.path + "/devnote.md");
  }

  static get PrefabStr(): string {
    return PrefabStr;
  }
};