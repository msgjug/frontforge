import AppNode, { property } from "../app_node";
import { RegClass } from "../serialize";
import { H5Utils } from "../utils";

@RegClass("Panel")
export default class Panel extends AppNode {
    @property("div[class=panel]")
    panel: HTMLDivElement = null;
    nav: HTMLDivElement = null;
    onLoad(): void {
        super.onLoad();
        // this.ele.onclick = this.onClickClose.bind(this);
        H5Utils.DragElement(this.panel, this.ele, this.nav);
    }
    onClickBlockInput(event) {
        event.stopPropagation();
    }
    onClickClose() {
        this.dispose();
    }
};