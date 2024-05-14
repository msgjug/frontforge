import AppNode from "../app_node";
import { RegClass } from "../serialize";
import PrefabStr from "./tab_view.prefab.html?raw"

@RegClass("TabView")
export default class TabView extends AppNode {
    pageContain: HTMLDivElement = null;
    linkContain: HTMLDivElement = null;

    curInd = -1;
    onLoad(): void {
        this.openTab(0);
    }
    openTab(ind: number) {
        if (this.curInd === ind) {
            return;
        }
        this.curInd = ind;
        let pages = this.pageContain.children;
        let links = this.linkContain.children;
        for (let i = 0; i < pages.length; i++) {
            let isCur = i === ind;
            let ele = pages[i];
            let link = links[i];
            if (ele instanceof HTMLElement) {
                ele.style.display = isCur ? "block" : "none";
            }
            if( link instanceof HTMLElement ) {
                if (isCur) {
                    link.setAttribute("cur", "");
                }
                else {
                    link.removeAttribute("cur");
                }
            }
        }
        this.subject.emit("changed", ind);
    }
    static get __BindPrefab__() {
        return PrefabStr;
    }
};