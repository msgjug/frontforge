import { RegClass } from "../serialize";
import PrefabMsgBox from './msgbox.prefab.html?raw'
import Panel from "./panel";
@RegClass("MsgBox")
export default class MsgBox extends Panel {
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
    onClickOk() {
        this.dispose();
    }
    static get PrefabStr():string {
        return PrefabMsgBox;
    }
};