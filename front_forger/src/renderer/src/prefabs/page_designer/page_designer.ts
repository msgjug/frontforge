import { app, utilityProcess } from "electron";
import { Protocol, ProtocolObjectCloseProject, ProtocolObjectOpenProject } from "../../../../classes/protocol_dist";
import AppNode from "../../core/app_node";
import { RegClass } from "../../core/serialize";
import MsgHub from "../../core/subject";
import EditorEnv from "../../env";
import HtmlDesigner from "../page_creator/html_designer/html_designer";
import PrefabStr from "./page_designer.prefab.html?raw";
import Utils from "../../core/utils";
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
        Utils.app.msgBox("设计器目前还在开发阶段，只提供简陋的浏览功能。内部实现是一个vite预览服务，http://localhost:4545。望周知。");
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