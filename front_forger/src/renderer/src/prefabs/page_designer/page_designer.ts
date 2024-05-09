import { Protocol, ProtocolObjectCloseProject, ProtocolObjectOpenProject } from "../../../../classes/protocol_dist";
import { AppNode } from "../../core/app_node";
import Macro from "../../core/macro";
import { RegClass } from "../../core/serialize";
import MsgHub from "../../core/subject";
import Utils, { rAF } from "../../core/utils";
import EditorEnv from "../../env";
import HtmlDesigner from "../page_creator/html_designer/html_designer";
import PrefabStr from "./page_designer.prefab.html?raw";
@RegClass("PageDesigner")
export default class PageDesigner extends AppNode {
    designer: HtmlDesigner = null;
    _updateId = 0;
    onDispose(): void {
        EditorEnv.offMessage(this);
        MsgHub.targetOff(this);
    }
    onLoad(): void {
        EditorEnv.onMessage(this.onMessage, this);
    }
    async onOpenProject(msg: ProtocolObjectOpenProject) {
        await EditorEnv.InitProjectConfig(msg.project_conf.path);
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