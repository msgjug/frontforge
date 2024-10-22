import { Protocol, ProtocolObjectCloseProject } from "../../../../classes/protocol_dist";
import AppNode from "../../core/app_node";
import { RegClass } from "../../core/serialize";
import MsgHub from "../../core/subject";
import EditorEnv from "../../env";
import CodeEditor from "../page_creator/code_editor/code_editor";
import Nav from "../title/nav";
import PrefabStr from "./page_code.prefab.html?raw";
@RegClass("PageCode")
export default class PageCode extends AppNode {
    codeEditor: CodeEditor = null;

    onDispose(): void {
        EditorEnv.offMessage(this);
        MsgHub.targetOff(this);
        Nav.ins.btnOption.style.display = "none";
    }
    onLoad(): void {
        EditorEnv.onMessage(this.onMessage, this);
        MsgHub.on("option", this.onClickOption, this);
        Nav.ins.btnOption.style.display = "";
    }
    onMessage(msg: Protocol) {
        switch (true) {
            case msg instanceof ProtocolObjectCloseProject:
                window.close();
                break;
        }
    }
    onClickOption() {
        window.electron.ipcRenderer.invoke("FF:CreateWindow", "box_code_option", 0, 0, 400, 140, "none", "BoxCodeOption", "code");
    }
    static get PrefabStr(): string {
        return PrefabStr;
    }
};