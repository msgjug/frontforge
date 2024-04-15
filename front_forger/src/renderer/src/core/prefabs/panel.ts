import { AppNode, property } from "../app_node";
import { RegClass } from "../serialize";

@RegClass("Panel")
export default class Panel extends AppNode {
    @property("div[name=panel]")
    divPanel: HTMLDivElement = null;
    onLoad(): void {
        super.onLoad();
        this.ele.onclick = this.onClickClose.bind(this);
        this.divPanel.onclick = this.onClickBlockInput.bind(this);
    }
    onClickBlockInput(event) {
        event.stopPropagation();
    }
    onClickClose() {
        this.dispose();
    }
};