import { RegClass } from "../serialize";
import Panel from "./panel";

@RegClass("Panel2")
export default class Panel2 extends Panel {
    onLoad(): void {
        super.onLoad();
        this.ele.onclick = this.onClickClose.bind(this);
    }
};