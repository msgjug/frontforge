import { AppNode, property } from "../app_node";
import { RegClass } from "../serialize";

@RegClass("Panel")
export default class Panel extends AppNode {
    onLoad(): void {
        super.onLoad();
        this.ele.onclick = this.onClickClose.bind(this);
    }
    onClickBlockInput(event) {
        event.stopPropagation();
    }
    onClickClose() {
        this.dispose();
    }
};