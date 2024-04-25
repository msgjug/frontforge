import { RegClass } from "../serialize";
import PrefabMsgBoxYesNo from './msgbox_yes_no.prefab.html?raw'
import Panel from "./panel";
@RegClass("MsgBox")
export default class MsgBoxYesNo extends Panel {
    lbTitle: HTMLButtonElement = null;
    lbText: HTMLButtonElement = null;

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