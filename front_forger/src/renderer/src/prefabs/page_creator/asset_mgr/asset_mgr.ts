import { DirentHandle } from "../../../../../classes/dirent_handle";
import { AppNode } from "../../../core/app_node";
import Prefab from "../../../core/prefab";
import { RegClass } from "../../../core/serialize";
import Utils from "../../../core/utils";
import EditorEnv from "../../../env";
import { ProtocolObjectPrefabConfig } from "../../../protocol_dist";
import AssetGroupItem from "./asset_group_item";
import AssetItem from "./asset_item";
import PrefabStr from "./asset_mgr.prefab.html?raw"
import BoxNewPrefabAsset from "./box_new_prefab_asset";

@RegClass("AssetMgr")
export default class AssetMgr extends AppNode {
  contain: HTMLDivElement = null;
  groupCol: { [key: string]: AssetGroupItem } = {};
  direntHandle: DirentHandle = null;
  curItem: AssetItem = null;

  async listDir() {
    let projConf = EditorEnv.GetProjectConfig();
    this.direntHandle = await window.electron.ipcRenderer.invoke("FF:ListDir", projConf.path);
    this.refresh();
  }
  refresh() {
    this.groupCol = {};
    this.disposeAllChildren(this.contain);
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
    group.addAssetItem(prefabConfig);
  }
  addGroup(groupName: string) {
    let groupItem = Prefab.Instantiate(AssetGroupItem);
    groupItem.setData(groupName);
    groupItem.lbName.innerText = groupName;
    this.groupCol[groupName] = groupItem;
    this.addChild(groupItem, this.contain);
    groupItem.subject.on("click-item", this.onClickAssetItem, this);
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
    }

    this.curItem = item;
    if (this.curItem) {
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
  }
  async onNewPrefabAsset(conf: ProtocolObjectPrefabConfig) {
    let projConf = EditorEnv.GetProjectConfig();
    projConf.prefabs_list.push(conf);
    this.addPrefabAsset(conf);

    //保存项目数据
    EditorEnv.SetProjectConfig(projConf);
    //保存编辑器数据
    EditorEnv.SaveEditorConfig();

    //获取dh
    let newDh = await window.electron.ipcRenderer.invoke("FF:GetDirentHandle", projConf.path);
    //更新DH
    let dh = this.getDirentHandleByPath("src/prefabs");
    dh.children.push(newDh);
  }
  refreshSetStart(startPrefabName: string ) {
    for (let gk in this.groupCol) {
      let group = this.groupCol[gk];
      for (let key in group.itemCol) {
        if (group.itemCol[key].prefabConfig.name === startPrefabName) {
          group.itemCol[key].setStart();
        }
        else {
          group.itemCol[key].unsetStart();
        }
      }
    }
  }
  setStartAsset(prefabConfig: ProtocolObjectPrefabConfig) {
    this.refreshSetStart(prefabConfig.name);
  }
  deleteAsset(prefabConfig: ProtocolObjectPrefabConfig) {
    let projConf = EditorEnv.GetProjectConfig();
    let foundInd = projConf.prefabs_list.findIndex(ele => ele === prefabConfig);
    if (foundInd !== -1) {
      projConf.prefabs_list.splice(foundInd, 1);
    }

    if (this.groupCol[prefabConfig.group]) {
      let group = this.groupCol[prefabConfig.group]
      group.itemCol[prefabConfig.name].dispose();
    }

    EditorEnv.SetProjectConfig(projConf);
    EditorEnv.SaveEditorConfig();
  }

  static get PrefabStr(): string {
    return PrefabStr;
  }
};