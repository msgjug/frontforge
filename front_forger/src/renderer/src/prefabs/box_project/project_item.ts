import { AppNode } from "../../core/app_node";
import { RegClass } from "../../core/serialize";
import { ProtocolObjectProjectConfig } from "../../../../classes/protocol_dist";
import PrefabStr from "./project_item.prefab.html?raw"
@RegClass("ProjectItem")
export default class ProjectItem extends AppNode {
  lbName: HTMLDivElement = null;
  lbVersion: HTMLDivElement = null;

  config: ProtocolObjectProjectConfig = null;

  isBlur = false;
  setData(config: ProtocolObjectProjectConfig) {
    this.config = config;
    this.lbName.innerHTML = this.config.app_name;
    this.lbVersion.innerHTML = this.config.app_version;
  }
  onClickDel() {
    if (this.isBlur) {
      return;
    }
    this.subject.emit("del", this.config);
  }
  onClickOpen() {
    if (this.isBlur) {
      return;
    }
    this.subject.emit("open", this.config);
  }

  blur() {
    this.isBlur = true;
    this.ele.setAttribute("blur", "");
  }
  unblur() {
    this.isBlur = false;
    this.ele.removeAttribute("blur");
  }

  static get PrefabStr() {
    return PrefabStr;
  }
};