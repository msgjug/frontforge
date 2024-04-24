import { Protocol, ProtocolObjectEditorConfigChange } from "../../../../../classes/protocol_dist";
import { AppNode } from "../../../core/app_node";
import { RegClass } from "../../../core/serialize";
import EditorEnv, { ACE_THEME } from "../../../env";
import { Selector } from "../creator_main/selector";
import PrefabStr from "./box_code_option.prefab.html?raw"
@RegClass("BoxCodeOption")
export default class BoxCodeOption extends AppNode {
    btnWrap: HTMLButtonElement = null;
    selTheme: Selector = null;
    selFontSize: Selector = null;
    onDispose(): void {
        EditorEnv.offMessage(this);
    }
    onLoad(): void {
        EditorEnv.onMessage(this.onMessage, this);

        this.selTheme.setData(ACE_THEME);
        this.selFontSize.setData(["8", "10", "12", "14", "16", "18", "20"]);
        this.refresh();
    }
    onMessage(msg: Protocol) {
        switch (true) {
            case msg instanceof ProtocolObjectEditorConfigChange:
                this.refresh();
                break;
        }
    }
    async refresh() {
        let conf = await EditorEnv.GetEditorConfig();
        this.btnWrap.innerText = conf.wrap_mode ? "Wrap" : "NoWrap";
        this.selTheme.select(conf.theme);
        this.selFontSize.select(conf.font_size.toFixed(0));
    }
    async onToggleWrap() {
        let conf = await EditorEnv.GetEditorConfig();
        conf.wrap_mode = !conf.wrap_mode;
        EditorEnv.SaveEditorConfig();
        let msg = new ProtocolObjectEditorConfigChange();
        msg.editor_conf = conf;
        EditorEnv.postMessage(msg);
    }
    async onSelectTheme(evt) {
        let conf = await EditorEnv.GetEditorConfig();
        conf.theme = evt.target.value;
        EditorEnv.SaveEditorConfig();
        let msg = new ProtocolObjectEditorConfigChange();
        msg.editor_conf = conf;
        EditorEnv.postMessage(msg);
    }
    async onSelectFrontSize(evt) {
        let conf = await EditorEnv.GetEditorConfig();
        conf.font_size = Number(evt.target.value);
        EditorEnv.SaveEditorConfig();
        let msg = new ProtocolObjectEditorConfigChange();
        msg.editor_conf = conf;
        EditorEnv.postMessage(msg);
    }

    onClickClose() {
        window.close();
    }
    static get PrefabStr() {
        return PrefabStr;
    }
};