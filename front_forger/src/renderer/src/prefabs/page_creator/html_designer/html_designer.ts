import { PreviewMsgType, Protocol, ProtocolObjectPreviewMsg, ProtocolObjectSelectPrefab } from "../../../../../classes/protocol_dist";
import AppNode from "../../../core/app_node";
import { RegClass } from "../../../core/serialize";
import PrefabStr from "./html_designer.prefab.html?raw"
import EditorEnv from "../../../env";
import Utils from "../../../core/utils";

@RegClass("HtmlDesigner")
export default class HtmlDesigner extends AppNode {
    frame: HTMLIFrameElement = null;
    static get PrefabStr(): string {
        return PrefabStr;
    }
    postMessage(type: PreviewMsgType, ...args: any[]) {
        let msg = new ProtocolObjectPreviewMsg();
        msg.type = type;
        msg.args = args;
        // this.frame.contentWindow.postMessage(msg, "http://localhost:4545/");
        this.frame.contentWindow.postMessage(msg, "http://localhost:4545");
    }

    onDispose(): void {
        EditorEnv.offMessage(this);
    }
    onLoad(): void {
        EditorEnv.onMessage(this.onMessage, this);
    }

    onMessage(msg: Protocol) {
        switch (true) {
            case msg instanceof ProtocolObjectSelectPrefab:
                this.postMessage(PreviewMsgType.Prefab, Utils.SnakeToPascal(msg.prefab_conf.name));
                break;
        }
    }

    curPrefabName = "";
    onClickRefresh() {
        this.postMessage(PreviewMsgType.Refresh);
    }
    onClickSelect() {
        this.postMessage(PreviewMsgType.Select);
    }
};