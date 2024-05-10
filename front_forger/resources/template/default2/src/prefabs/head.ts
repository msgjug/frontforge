import { AppNode } from "../core/app_node";
import { RegClass } from "../core/serialize";
import Utils from "../core/utils";
@RegClass("Head")
export default class Head extends AppNode {
    onLoad(): void {
        this.ele.parentElement.insertBefore(this.ele, Utils.scene.ele);
    }
};