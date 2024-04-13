import { AppConfig } from "../../core/app_config";
import { AppNode, property } from "../../core/app_node";
import { Col } from "../../core/data_ext";
import Prefab from "../../core/prefab";
import { RegClass } from "../../core/serialize";
import PrefabStr from "./page_creator.prefab.html?raw"
import { ScriptItem } from "./script_item";

@RegClass("PageCreator")
export default class PageCreator extends AppNode {
  @property("div[name=scripts]")
  scriptContain: HTMLDivElement = null;
  scriptItemCol: Col<ScriptItem> = {};

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
    this.scriptItemCol[scriptName] = item;
  }

  delScriptItem(scriptName: string) {
    if (this.scriptItemCol[scriptName]) {
      this.scriptItemCol[scriptName].dispose();
      delete this.scriptItemCol[scriptName];
    }
  }

  static get PrefabStr(): string {
    return PrefabStr;
  }
};