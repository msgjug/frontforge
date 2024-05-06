import { AppNode } from "../../../core/app_node";
import Prefab from "../../../core/prefab";
import { RegClass } from "../../../core/serialize";
import EditorEnv, { ACE_THEME } from "../../../env";
import { Protocol, ProtocolObjectDeletePrefab, ProtocolObjectEditorConfig, ProtocolObjectEditorConfigChange, ProtocolObjectFlagPrefab, ProtocolObjectOpenFile, ProtocolObjectPrefabConfig, ProtocolObjectSaveFile, ProtocolObjectSavePrefab, ProtocolObjectSelectPrefab } from "../../../../../classes/protocol_dist";
import ACEEditor from "./ace_editor";
import PrefabStr from "./creator_main.prefab.html?raw"
import { Selector } from "./selector";
import { TabView } from "./tab_view";
import Utils, { Sync } from "../../../core/utils";
import MsgHub from "../../../core/subject";
import { utimesSync } from "fs";

@RegClass("CreatorMain")
export default class CreatorMain extends AppNode {
    lbName: HTMLDivElement = null;
    tabView: TabView = null;
    aceWrap: HTMLDivElement = null;
    aceList: ACEEditor[] = [];
    btnWrap: HTMLButtonElement = null;

    _mode: "other" | "prefab" = "prefab";
    get mode() {
        return this._mode;
    }
    set mode(val) {
        this._mode = val;
        this.tabView.active = this._mode === "prefab";

        if (this._mode === "prefab") {
            this.aceList[2].setValue("");
            this.aceList[2].hide();
            this.onTabViewSelect();
        }
        else {
            this.aceList[0].setValue("");
            this.aceList[1].setValue("");
            this.aceList[2].show();
            this.aceList[0].hide();
            this.aceList[1].hide();
        }
    }

    //prefab mode 时
    conf: ProtocolObjectPrefabConfig = null;
    tsStr: string = "";
    domStr: string = "";

    //other mode 时
    fileStr: string = "";
    filePath: string = "";

    onDispose(): void {
        MsgHub.targetOff(this);
        EditorEnv.offMessage(this);
    }
    async onLoad() {
        EditorEnv.onMessage(this.onMessage, this);

        this.lbName.innerText = "";
        this.tabView.subject.on("select", this.onTabViewSelect, this);
        for (let i = 0; i < 3; i++) {
            let ace = Prefab.Instantiate(ACEEditor);
            this.addChild(ace, this.aceWrap);
            this.aceList.push(ace);
        }
        this.aceList[0].setMode("typescript");
        this.aceList[1].setMode("html");
        this.aceList[2].setMode("css");

        MsgHub.on("hot-key", this.onHotKey, this);

        await Sync.DelayTime(0);
        this.mode = this.mode;
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
            case msg instanceof ProtocolObjectOpenFile:
                if (!msg.path) {
                    this.setOther("", "", "");
                }
                else {
                    this.setOther(msg.path, msg.str, msg.mode);
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
    setOther(path: string, fileStr: string, mode: string) {
        if (this.filePath) {
            this.save(true);
            this.filePath = "";
        }
        this.mode = "other";
        this.fileStr = fileStr;
        this.filePath = path;

        if (this.filePath) {
            this.aceList[2].setMode(mode);
            this.aceList[2].setValue(this.fileStr);
            this.lbName.innerText = Utils.GetNameByPath(this.filePath);
        }
        else {
            this.aceList[2].setValue("");
            this.lbName.innerText = "";
        }
    }
    setData(conf: ProtocolObjectPrefabConfig, tsStr: string, domStr: string) {
        if (this.conf) {
            this.save(true);
            this.conf = null;
        }

        this.mode = "prefab";
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
        if (this.mode === "prefab") {
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
            EditorEnv.postMessageExceptSelf(msg);
        }
        else {
            this.fileStr = this.aceList[2].getValue();
            let msg = new ProtocolObjectSaveFile();
            msg.path = this.filePath;
            msg.str = this.fileStr;
            msg.silent = silent;
            EditorEnv.postMessageExceptSelf(msg);
        }
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
        EditorEnv.postMessageExceptSelf(msg);
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
        EditorEnv.postMessageExceptSelf(msg);
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

        for (let i = 0; i < this.aceList.length; i++) {
            this.aceList[i].resize();
        }
    }

    static get PrefabStr(): string {
        return PrefabStr;
    }
};