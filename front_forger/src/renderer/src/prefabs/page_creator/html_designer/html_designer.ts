import { ProtocolObjectProjectConfig } from "../../../../../classes/protocol_dist";
import { AppNode } from "../../../core/app_node";
import { RegClass } from "../../../core/serialize";
import Utils, { Sync } from "../../../core/utils";
import EditorEnv from "../../../env";
import PrefabStr from "./html_designer.prefab.html?raw"

@RegClass("HtmlDesigner")
export default class HtmlDesigner extends AppNode {
    frame: HTMLIFrameElement = null;
    protected _viewPort = "";
    onDispose(): void {
        this.stopProject();
    }

    async runProject(projConf: ProtocolObjectProjectConfig) {
        if (!projConf.entrance_prefab_name) {
            // Utils.app.msgBox("请设置入口");
            return;
        }


        this._viewPort = await window.electron.ipcRenderer.invoke("FF:RunProject", projConf.toMixed());

        let meta = document.createElement("meta");
        // <meta http-equiv="Content-Security-Policy" content="default-src 'self'; frame-src 'self' http://localhost:10751;">
        meta.setAttribute("http-equiv", "Content-Security-Policy")
        meta.setAttribute("content", `default-src 'self'; frame-src 'self' http://localhost:${this._viewPort}/;`)
        document.head.appendChild(meta);

        await Sync.DelayTime(0.5);
        // port
        this.frame.src = `http://localhost:${this._viewPort}`;
    }

    async stopProject() {
        if (this._viewPort) {
            await window.electron.ipcRenderer.invoke("FF:StopProject", this._viewPort);
        }
    }


    static get PrefabStr(): string {
        return PrefabStr;
    }
};