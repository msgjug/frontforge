import AppNode from "../app_node";
import { RegClass } from "../serialize";
import { H5Utils } from "../utils";
import PrefabStr from "./fold_contain.prefab.html?raw";

@RegClass("FoldContain")
export default class FoldContain extends AppNode {
    isFold = false;

    lbArrow: HTMLSpanElement = null;
    lbTitle: HTMLSpanElement = null;

    refCtor(refEle: Element): void {
        this.lbTitle.innerText = refEle.getAttribute("legend") || "标题";

        let children = Array.from(refEle.children);
        for (let i = 0; i < children.length; i++) {
            let ele = children[i];
            ele.remove();
            this.ele.appendChild(ele);
        }

        H5Utils.CopyStyle(refEle, this.ele);
    }
    onToggle() {
        this.isFold = !this.isFold;

        if (this.isFold) {
            this.lbArrow.innerText = "+";
            this.ele.style.overflowY = "hidden";
            this.ele.style.height = "1em";
        }
        else {
            this.lbArrow.innerText = "-";
            this.ele.style.overflowY = "unset";
            this.ele.style.height = "unset";
        }
    }
    static get __BindPrefab__(): string {
        return PrefabStr;
    }
};