import { AppNode } from "../../core/app_node";
import Macro from "../../core/macro";
import { RegClass } from "../../core/serialize";
import MsgHub from "../../core/subject";
import Utils from "../../core/utils";
import PrefabStr from "./nav.prefab.html?raw";
@RegClass("Nav")
export default class Nav extends AppNode {
    lbTitle: HTMLDivElement = null;
    btnOption: HTMLButtonElement = null;
    onLoad(): void {
        Nav.__ins = this;
        const PageStamp = Utils.parseUrlParam(false).ps || "none";
        const BoxStamp = Utils.parseUrlParam(false).box || "none";
        this.lbTitle.innerText =
            {
                BoxProject: "项目",
                BoxCodeOption:"代码编辑器设置",
                BoxHelp:"帮助"
            }[BoxStamp]
            || {
                index: "🔨" + Macro.APP_NAME,
                code: "代码编辑器"
            }[PageStamp];
    }
    onClickClose() {
        const PageStamp = Utils.parseUrlParam(false).ps || "none";
        const BoxStamp = Utils.parseUrlParam(false).box || "none";

        switch (BoxStamp) {
            case "BoxProject":
                window.electron.ipcRenderer.invoke("FF:Quit");
                return;
                break;
        }
        switch (PageStamp) {
            case "index":
                window.electron.ipcRenderer.invoke("FF:Quit");
                return;
                break;
        }

        window.close();
    }

    private static __ins: Nav = null;
    static get ins() {
        return this.__ins;
    }

    onClickOption() {
        MsgHub.emit("option");
    }
    static get PrefabStr(): string {
        return PrefabStr;
    }
};