import { AppNode } from "../../../core/app_node";
import Prefab from "../../../core/prefab";
import { RegClass } from "../../../core/serialize";
import EditorEnv, { ACE_THEME } from "../../../env";
import { Protocol, ProtocolObjectDeletePrefab, ProtocolObjectEditorConfig, ProtocolObjectEditorConfigChange, ProtocolObjectFlagPrefab, ProtocolObjectPrefabConfig, ProtocolObjectSavePrefab, ProtocolObjectSelectPrefab } from "../../../../../classes/protocol_dist";
import ACEEditor from "./ace_editor";
import PrefabStr from "./creator_main.prefab.html?raw"
import { Selector } from "./selector";
import { TabView } from "./tab_view";
import Utils from "../../../core/utils";
import MsgHub from "../../../core/subject";

@RegClass("CreatorMain")
export default class CreatorMain extends AppNode {
    lbName: HTMLDivElement = null;
    tabView: TabView = null;
    aceWrap: HTMLDivElement = null;
    aceList: ACEEditor[] = [];
    btnWrap: HTMLButtonElement = null;

    conf: ProtocolObjectPrefabConfig = null;
    tsStr: string = "";
    domStr: string = "";

    onDispose(): void {
        MsgHub.targetOff(this);
        EditorEnv.offMessage(this);
    }
    onLoad(): void {
        EditorEnv.onMessage(this.onMessage, this);

        this.lbName.innerText = "";
        this.tabView.subject.on("select", this.onTabViewSelect, this);
        for (let i = 0; i < 2; i++) {
            let ace = Prefab.Instantiate(ACEEditor);
            this.addChild(ace, this.aceWrap);
            this.aceList.push(ace);
        }
        this.aceList[0].setMode("typescript");
        this.aceList[1].setMode("html");

        this.onTabViewSelect();

        MsgHub.on("hot-key", this.onHotKey, this);
    }
    onMessage(msg: Protocol) {
        switch (true) {
            case msg instanceof ProtocolObjectSelectPrefab:
                if (!msg.valid) {
                    this.setData(null, "", "");
                }
                else {
                    this.setData(msg.prefab_conf, msg.ts_str, msg.dom_str);
                }
                break;
            case msg instanceof ProtocolObjectEditorConfigChange:
                this.refreshEditors(msg.editor_conf);
                break;
        }
    }
    async refreshEditors(conf: ProtocolObjectEditorConfig) {
        this.aceList.forEach(ace => {
            ace.wrapMode = conf.wrap_mode;
            ace.setTheme(conf.theme);
            ace.setFontSize(conf.font_size);
        });
    }
    setData(conf: ProtocolObjectPrefabConfig, tsStr: string, domStr: string) {
        if (this.conf) {
            this.save(true);
            this.conf = null;
        }

        this.conf = conf;
        this.tsStr = tsStr;
        this.domStr = domStr;

        if (this.conf) {
            this.aceList[0].setValue(this.tsStr);
            this.aceList[1].setValue(this.domStr);
            this.lbName.innerText = conf.name;
        }
        else {
            this.aceList[0].setValue("");
            this.aceList[1].setValue("");
            this.lbName.innerText = "";
        }
    }

    onHotKey(tag) {
        switch (tag) {
            case "save":
                this.onClickSave();
                break;
        }
    }
    save(silent = false) {
        if (!this.conf) {
            return;
        }
        this.tsStr = this.aceList[0].getValue();
        this.domStr = this.aceList[1].getValue();

        let msg = new ProtocolObjectSavePrefab();
        msg.prefab_conf = this.conf;
        msg.ts_str = this.tsStr;
        msg.dom_str = this.domStr;
        msg.silent = silent;
        EditorEnv.postMessage(msg);
    }
    onClickSave() {
        this.save();
    }
    onClickSetStart() {
        if (!this.conf) {
            return;
        }
        let msg = new ProtocolObjectFlagPrefab();
        msg.prefab_conf = this.conf;
        EditorEnv.postMessage(msg);
    }
    async onClickDelete() {
        if (!this.conf) {
            return;
        }
        if (!await Utils.app.msgBoxYesNo(`删除${this.conf.name}?`)) {
            return;
        }

        let msg = new ProtocolObjectDeletePrefab();
        msg.prefab_conf = this.conf;
        EditorEnv.postMessage(msg);
    }
    onTabViewSelect() {
        console.log("select:", this.tabView.curInd);
        switch (this.tabView.curInd) {
            case 0:
                this.aceList[0].show();
                this.aceList[1].hide();
                break;
            case 1:
                this.aceList[0].hide();
                this.aceList[1].show();
                break;
            case 2:
                this.aceList[0].show();
                this.aceList[1].show();
                this.aceWrap.style.flexDirection = "column";
                break;
            case 3:
                this.aceList[0].show();
                this.aceList[1].show();
                this.aceWrap.style.flexDirection = "row";
                break;
        }
        this.aceList[0].resize();
        this.aceList[1].resize();
    }

    static get PrefabStr(): string {
        return PrefabStr;
    }
};