import AppNode from "../core/app_node";
import { RegClass } from "../core/serialize";
import Utils, { H5Utils } from "../core/utils";
@RegClass("PageUI")
export default class PageUI extends AppNode {
    dragContain: HTMLDivElement = null;
    dragItem: HTMLDivElement = null;
    onLoad() {
        H5Utils.DragElement(this.dragItem, this.dragContain);
    }
    onClickMsgBox() {
        Utils.app.msgBox("12312312123123123123123123123");
    }
    onClickMsgBoxYesNo() {
        Utils.app.msgBoxYesNo("12312312123123123123123123123");
    }

};