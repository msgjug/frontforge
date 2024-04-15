import { AppConfig } from "../../core/app_config";
import { AppNode, property } from "../../core/app_node";
import Prefab from "../../core/prefab";
import { RegClass } from "../../core/serialize";
import PrefabStr from "./page_creator.prefab.html?raw"
import { ScriptItem } from "./script_item";
import Utils from "../../core/utils";

export class CallMethod {
  method = "";
  args: any[] = [];
};

@RegClass("PageCreator")
export default class PageCreator extends AppNode {
  @property("div[name=script_contain]")
  scriptContain: HTMLDivElement = null;
  scriptItemCol: { [key: string]: ScriptItem } = {};

  @property("input[name=script_name]")
  ebNewScript: HTMLInputElement = null;
  @property("button[name=btn_new_script]", { onclick: "onClickNewScript" })
  btnNewScript: HTMLButtonElement = null;
  @property("button[name=btn_test_ipc]", { onclick: "onClickTestIPC" })
  btnTestIPC: HTMLButtonElement = null;

  appConfig: AppConfig = null;

  onLoad(): void {
    this.appConfig = new AppConfig();
    for (let key in this.appConfig.scriptCol) {
      let scriptName = this.appConfig.scriptCol[key];
      this.addScriptItem(scriptName);
    }
  }

  addScriptItem(scriptName: string) {
    let item = Prefab.Instantiate(ScriptItem);
    this.addChild(item, this.scriptContain);
    item.setData(scriptName);
    item.subject.on("del", this.onClickDelItem, this);
    this.scriptItemCol[scriptName] = item;
  }

  delScriptItem(scriptName: string) {
    if (this.scriptItemCol[scriptName]) {
      delete this.appConfig.scriptCol[scriptName];
      this.scriptItemCol[scriptName].dispose();
      delete this.scriptItemCol[scriptName];
    }
  }
  onClickDelItem(scriptName: string) {
    this.delScriptItem(scriptName);
  }
  async onClickTestIPC() {
    let rtn = await window.electron.ipcRenderer.invoke('FF:OpenApp');
    console.log(rtn);
  }
  onClickNewScript() {
    let sn = this.ebNewScript.value;
    if (!sn) {
      return;
    }
    if (this.appConfig.scriptCol[sn]) {
      Utils.app.msgBox("已经有同名文件");
      return;
    }
    this.appConfig.scriptCol[sn] = sn;
    this.addScriptItem(sn);
  }

  static get PrefabStr(): string {
    return PrefabStr;
  }
};