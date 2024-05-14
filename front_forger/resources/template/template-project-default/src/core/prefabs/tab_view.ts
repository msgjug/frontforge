import { AppNode } from "../app_node";
import { RegClass } from "../serialize";
import PrefabStr from "./tab_view.prefab.html?raw"

@RegClass("TabView")
export default class TabView extends AppNode {
    pageContain: HTMLDivElement = null;
    linkContain: HTMLDivElement = null;

    curInd = -1;
    readonly = false;
    onLoad(): void {
        this.openTab(0);
    }
    refCtor(refEle: Element) {
        this.readonly = Boolean(refEle.getAttribute("readonly") || "false");
        let tabName = refEle.getAttribute("tab_name") || "#";
        let children = Array.from(refEle.children);

        for (let i = 0; i < children.length; i++) {
            let ele = children[i];
            let tabNameSpec = ele.getAttribute("tab_name") || tabName;
            this.pageContain.appendChild(ele);

            let tab = document.createElement("div");
            tab.className = "tab-link";
            tab.onclick = () => {
                this.onClickOpenTab(i);
            };
            tab.innerText = tabNameSpec.replace("#", `${i + 1}`);
            this.linkContain.appendChild(tab);
        }
    }
    onClickOpenTab(ind: number) {
        if (this.readonly) {
            return;
        }
        this.openTab(ind);
    }
    openTab(ind: number, silent = false) {
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
            if (link instanceof HTMLElement) {
                if (isCur) {
                    link.setAttribute("cur", "");
                }
                else {
                    link.removeAttribute("cur");
                }
            }
        }
        if (!silent) {
            this.subject.emit("changed", ind);
        }
    }
    static get __BindPrefab__() {
        return PrefabStr;
    }
};