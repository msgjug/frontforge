import { AppNode, property } from "../app_node";
import { RegClass } from "../serialize";
import PrefabMsgBoxYesNo from './msgbox_yes_no.prefab.html?raw'
import Panel from "./panel";
@RegClass("MsgBox")
export default class MsgBoxYesNo extends Panel {
    @property("button[name=yes]", { onclick: "onClickYes" })
    btnYes: HTMLButtonElement = null;
    @property("button[name=no]", { onclick: "onClickNo" })
    btnNo: HTMLButtonElement = null;
    @property("b[name=title]")
    lbTitle: HTMLButtonElement = null;
    @property("span[name=text]")
    lbText: HTMLButtonElement = null;
    @property("div[name=panel]")
    divPanel: HTMLDivElement=null;

    get title() {
        return this.lbTitle.innerText;
    }
    set title(val) {
        this.lbTitle.innerText = val;
    }
    get text() {
        return this.lbText.innerHTML;
    }
    set text(val) {
        this.lbText.innerHTML = val;
    }

    onClickYes() {
        this.subject.emit("yes");
        this.dispose();
    }
    onClickNo() {
        this.subject.emit("no");
        this.dispose();
    }
    static get PrefabStr(){
        return PrefabMsgBoxYesNo;
    }
};