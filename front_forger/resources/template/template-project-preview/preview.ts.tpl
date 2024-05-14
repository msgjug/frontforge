import { AppNode } from "./core/app_node";
import Prefab from "./core/prefab";
import { n2c } from "./core/serialize";
import MsgHub from "./core/subject";
import Utils from "./core/utils";
import { RegClass } from "./core/serialize";
import PrefabStr from "./preview.prefab.html?raw"

enum PreviewMsgType {
    Other,
    Refresh,
    Select,
    Prefab,
    Page,
};

@RegClass("__Preview__")
export default class __Preview__ extends AppNode {
    static get __BindPrefab__() {
        return PrefabStr;
    }

    dashedGzimo: HTMLDivElement = null;
    selecteddGzimo: HTMLDivElement = null;

    lbTitle: HTMLDivElement = null;
    lbTitleSelected: HTMLDivElement = null;

    curElement: HTMLElement = null;

    onLoad() {
        window.onmessage = this.onMessage.bind(this);

        document.addEventListener('mousemove', (event) => {
            var x = event.clientX;
            var y = event.clientY;
            var targetElement = document.elementFromPoint(x, y);
            if (targetElement instanceof HTMLElement) {
                let rect = targetElement.getBoundingClientRect();
                this.dashedGzimo.style.left = `${rect.left}px`;
                this.dashedGzimo.style.top = `${rect.top}px`;
                this.dashedGzimo.style.width = `${rect.width}px`;
                this.dashedGzimo.style.height = `${rect.height}px`;
                this.lbTitle.innerText = `<${targetElement.tagName} class="${targetElement.className}">`
            }
        });
        document.addEventListener('mousedown', (event) => {
            var targetElement = document.elementFromPoint(event.pageX, event.pageY);
            if (targetElement instanceof HTMLElement) {
                this.curElement = targetElement;
                let rect = targetElement.getBoundingClientRect();
                this.selecteddGzimo.style.left = `${rect.left}px`;
                this.selecteddGzimo.style.top = `${rect.top}px`;
                this.selecteddGzimo.style.width = `${rect.width}px`;
                this.selecteddGzimo.style.height = `${rect.height}px`;
                this.lbTitleSelected.innerText = `<${targetElement.tagName} class="${targetElement.className}">`
            }
        });
        Utils.scene.toast("PreviewReady");
        Utils.scene.curPage.dispose();
        Utils.scene.subject.on("replace-page", this.onReplacePage, this);
    }

    onMessage(ev: MessageEvent<any>) {
        let data = ev.data;
        switch (data.type) {
            case PreviewMsgType.Select:
                break;
            case PreviewMsgType.Refresh:
                window.location.href = window.location.href;
                break;
            case PreviewMsgType.Prefab:
                Utils.scene.disposeAllChildren();
                Utils.scene.addChild(Prefab.Instantiate(n2c(data.args[0])));
                break;
            case PreviewMsgType.Page:
                Utils.scene.replacePage(Prefab.Instantiate(n2c(data.args[0])));
                break;
        }
    }

    onReplacePage() {
    }
};