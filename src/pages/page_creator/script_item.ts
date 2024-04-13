import { AppNode, property } from "../../core/app_node";
import { RegClass } from "../../core/serialize";

@RegClass("ScriptItem")
export class ScriptItem extends AppNode {
  @property("div[name=name]")
  lbName: HTMLDivElement = null;
  @property("button[name=btn_x]", { onclick: "onClickDel" })
  btnX: HTMLButtonElement = null;

  scriptName = "";
  setData(scriptName: string) {
    this.scriptName = scriptName;
    this.lbName.innerHTML = scriptName;
  }

  onClickDel() {
    this.subject.emit("del", this.scriptName);
  }
};