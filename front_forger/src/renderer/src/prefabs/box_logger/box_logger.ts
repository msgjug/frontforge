import { RegClass } from "../../core/serialize";
import PrefabStr from "./box_logger.prefab.html?raw"
import { AppNode } from "../../core/app_node";
import Nav from "../title/nav";
import EditorEnv from "../../env";
import { Protocol, ProtocolObjectLog } from "../../../../classes/protocol_dist";
@RegClass("BoxLogger")
export default class BoxLogger extends AppNode {
    contain: HTMLDivElement = null;

    onLoad(): void {
        EditorEnv.onMessage(this.onMessage, this);
        BoxLogger.__ins = this;
        Nav.ins.btnLog.style.display = "none";
    }
    onDispose(): void {
        EditorEnv.offMessage(this);
        if (this === BoxLogger.__ins) {
            BoxLogger.__ins = null;
        }
    }
    onMessage(msg: Protocol) {
        switch (true) {
            case msg instanceof ProtocolObjectLog:
                this.addLog(msg.str);
                break;
        }
    }
    //发送LOG
    log(str: string) {
        let msg = new ProtocolObjectLog();
        msg.str = str;
        EditorEnv.postMessage(msg);
    }

    //接收到LOG
    addLog(str: string) {
        let ele = document.createElement("div");
        ele.className = "log-item";
        ele.innerText = str;
        ele.onclick = this.onClickItem.bind(this);
        this.contain.appendChild(ele);
    }
    curItem: HTMLDivElement = null;
    onClickItem(evt) {
        console.log(evt);
    }
    onClickClean() {
        this.contain.innerHTML = "";
    }

    private static __ins: BoxLogger = null;
    static get ins() {
        return this.__ins;
    }

    static get PrefabStr() {
        return PrefabStr;
    }
};

window["bl"] = BoxLogger;