import { AppNode } from "../../core/app_node";
import { RegClass } from "../../core/serialize";
import { ProtocolObjectProjectConfig } from "../../protocol_dist";
import PrefabStr from "./project_item.prefab.html?raw"
@RegClass("ProjectItem")
export default class ProjectItem extends AppNode {
    lbName: HTMLDivElement = null;
    lbVersion: HTMLDivElement = null;

    config: ProtocolObjectProjectConfig = null;
    setData(config: ProtocolObjectProjectConfig) {
        this.config = config;
        this.lbName.innerHTML = this.config.app_name;
        this.lbVersion.innerHTML = this.config.app_version;
    }
    onClickDel() {
      this.subject.emit("del", this.config);
    }
    onClickOpen() {
        this.subject.emit("open", this.config);
      }
    static get PrefabStr() {
        return PrefabStr;
    }
};