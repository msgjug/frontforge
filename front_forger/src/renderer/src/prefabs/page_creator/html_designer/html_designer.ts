import { AppNode } from "../../../core/app_node";
import { RegClass } from "../../../core/serialize";
import PrefabStr from "./html_designer.prefab.html?raw"

@RegClass("HtmlDesigner")
export default class HtmlDesigner extends AppNode {
    frame: HTMLIFrameElement = null;
    static get PrefabStr(): string {
        return PrefabStr;
    }


    onClickRefresh() {

    }
    onClickSelect() {
        this.frame.contentWindow.postMessage("Preview:select");
    }
};