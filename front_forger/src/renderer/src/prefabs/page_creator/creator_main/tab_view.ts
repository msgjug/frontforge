import { AppNode } from "../../../core/app_node";
import { RegClass } from "../../../core/serialize";

import DefaultDom from "./tab_view.prefab.html?raw";

@RegClass("TabView")
export class TabView extends AppNode {
    tabs: Element[] = [];
    curInd = 0;

    onLoad(): void {
        for (let i = 0; i < this.ele.children.length; i++) {
            let tab = <HTMLElement>this.ele.children[i];
            tab.onclick = () => {
                this.onClickItem(i);
            };
            this.tabs.push(tab);
        }
    }
    refresh() {
        this.tabs.forEach((tab, ind) => {
            if (this.curInd === ind) {
                tab.setAttribute("cur", "");
            }
            else {
                tab.removeAttribute("cur");
            }
        })
    }
    select(ind: number, silent = false) {
        this.curInd = ind;
        if (!silent) {
            this.subject.emit("select", ind);
        }
        this.refresh();
    }
    onClickItem(ind: number) {
        this.select(ind);
    }
    static get PrefabStr() {
        return DefaultDom;
    }
};