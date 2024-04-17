import { DirentHandle } from "../../../../../classes/dirent_handle";
import { AppNode } from "../../../core/app_node";
import Prefab from "../../../core/prefab";
import { RegClass } from "../../../core/serialize";
import EditorEnv, { ACE_THEME } from "../../../env";
import { ProtocolObjectPrefabConfig } from "../../../protocol_dist";
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
    selTheme: Selector = null;
    selFontSize: Selector = null;

    conf: ProtocolObjectPrefabConfig = null;
    dhTs: DirentHandle = null;
    dhDom: DirentHandle = null;

    onSelectFrontSize(evt) {
        let size = evt.target.value;
        EditorEnv.editorFontSize = Number(size);
        this.aceList.forEach(ace => {
            ace.setFontSize(EditorEnv.editorFontSize);
        })
    }
    onSelectTheme(evt) {
        let theme = evt.target.value;
        EditorEnv.editorTheme = theme;
        this.aceList.forEach(ace => {
            ace.setTheme(EditorEnv.editorTheme);
        })
    }
    onDispose(): void {
        MsgHub.targetOff(this);
    }
    onLoad(): void {
        this.selTheme.setData(ACE_THEME);
        this.selTheme.select(EditorEnv.editorTheme);

        this.selFontSize.setData(["8", "10", "12", "14", "16", "18", "20"]);
        this.selFontSize.select(EditorEnv.editorFontSize.toFixed(0));

        this.lbName.innerText = "12321312";
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
    setData(conf: ProtocolObjectPrefabConfig, dhTs: DirentHandle, dhDom: DirentHandle) {
        if( this.conf ){ 
            this.onClickSave();
            this.conf=null;
        }

        this.conf = conf;
        this.dhTs = dhTs;
        this.dhDom = dhDom;

        if (this.conf) {
            this.aceList[0].setValue(dhTs.dataStr);
            this.aceList[1].setValue(dhDom.dataStr);
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
    onClickSave() {
        if (!this.conf) {
            return;
        }
        this.dhTs.dataStr = this.aceList[0].getValue();
        this.dhDom.dataStr = this.aceList[1].getValue();
        this.subject.emit("save", this.conf);
    }
    onClickSetStart() {
        if (!this.conf) {
            return;
        }
        this.subject.emit("set-start", this.conf);
    }
    async onClickDelete() {
        if (!this.conf) {
            return;
        }
        if (!await Utils.app.msgBoxYesNo(`删除${this.conf.name}?`)) {
            return;
        }
        this.subject.emit("delete", this.conf);
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