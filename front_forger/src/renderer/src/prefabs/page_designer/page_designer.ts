import { Protocol, ProtocolObjectCloseProject, ProtocolObjectOpenProject } from "../../../../classes/protocol_dist";
import { AppNode } from "../../core/app_node";
import { RegClass } from "../../core/serialize";
import MsgHub from "../../core/subject";
import Utils from "../../core/utils";
import EditorEnv from "../../env";
import HtmlDesigner from "../page_creator/html_designer/html_designer";
import PrefabStr from "./page_designer.prefab.html?raw";
@RegClass("PageDesigner")
export default class PageDesigner extends AppNode {
    designer: HtmlDesigner = null;

    onDispose(): void {
        EditorEnv.offMessage(this);
        MsgHub.targetOff(this);
    }
    onLoad(): void {
        EditorEnv.onMessage(this.onMessage, this);
    }
    async onOpenProject(msg: ProtocolObjectOpenProject) {
        if ((await window.electron.ipcRenderer.invoke("FF:CheckProjectDir", msg.project_conf.path)).ret === 1) {
            return;
        }
        await EditorEnv.InitProjectConfig(msg.project_conf.path);

        let conf = EditorEnv.GetProjectConfig();
        this.designer.runProject(conf);
    }
    onMessage(msg: Protocol) {
        switch (true) {
            case msg instanceof ProtocolObjectOpenProject:
                this.onOpenProject(msg);
                break;
            case msg instanceof ProtocolObjectCloseProject:
                window.close();
                break;
        }
    }
    static get PrefabStr(): string {
        return PrefabStr;
    }
};