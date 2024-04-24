import data from "./core/cache_data";
import SerializeAble, { RegClass, Serialize } from "./core/serialize";
import { Protocol, ProtocolFactory, ProtocolObjectEditorConfig, ProtocolObjectProjectConfig } from "../../classes/protocol_dist";
import MsgHub, { Subject } from "./core/subject";


@RegClass("ACEConfig")
export class ACEConfig extends SerializeAble {
    @Serialize()
    fontSize = 12;
    @Serialize()
    theme = "ambiance";
    @Serialize()
    wrapMode = false;
};

export default class EditorEnv {
    protected static _EditorConfig: ProtocolObjectEditorConfig = null;
    static PortSubject: Subject = new Subject();

    static onIPCMessage(_, dat: JSON) {
        let msg = ProtocolFactory.CreateFromMixed(dat);
        this.PortSubject.emit("message", msg);
    }
    static onHotkey(_, tag: string) {
        MsgHub.emit("hot-key", tag);
    }
    static onIPCLog(_, deltaStr: string) {
        console.log("-log:", deltaStr);
        MsgHub.emit("log", deltaStr);
    }

    static onMessage(fn: (msg: Protocol) => void, obj: any) {
        this.PortSubject.on("message", fn, obj);
    }
    static offMessage(obj: any) {
        this.PortSubject.targetOff(obj);
    }

    static postMessage(msg: Protocol) {
        window.electron.ipcRenderer.send("FF:Message", msg.toMixed());
    }
    static postMessageExceptSelf(msg: Protocol) {
        window.electron.ipcRenderer.send("FF:Message", msg.toMixed(), true);
    }

    static async GetEditorConfig() {
        if (!this._EditorConfig) {
            this._EditorConfig = new ProtocolObjectEditorConfig();
            this._EditorConfig.fromMixed(await window.electron.ipcRenderer.invoke('FF:ReadEditorConfig'));
        }
        return this._EditorConfig;
    }
    static async SaveEditorConfig() {
        if (!this._EditorConfig) {
            this._EditorConfig = new ProtocolObjectEditorConfig();
            this._EditorConfig.fromMixed(await window.electron.ipcRenderer.invoke('FF:ReadEditorConfig'));
        }
        await window.electron.ipcRenderer.invoke('FF:SaveEditorConfig', this._EditorConfig.toField());
    }
    protected static _ProjectConfig: ProtocolObjectProjectConfig = null;
    static async InitProjectConfig(path: string) {
        this._ProjectConfig = new ProtocolObjectProjectConfig();
        let json = await window.electron.ipcRenderer.invoke('FF:ReadProjectConfig', path);
        this._ProjectConfig.fromMixed(json);
    }
    static GetProjectConfig() {
        return this._ProjectConfig;
    }
    static SetProjectConfig(config: ProtocolObjectProjectConfig) {
        this._ProjectConfig = config;
        if (this._ProjectConfig) {
            window.electron.ipcRenderer.invoke('FF:SaveProjectConfig', this._ProjectConfig.toMixed());
        }
    }
    static async CreateEditor(ele: Element) {
        //@ts-ignore
        if (ace) {
            let conf = await this.GetEditorConfig();
            //@ts-ignore
            let editor = ace.edit(ele);
            editor.setTheme(`ace/theme/${conf.theme}`);
            editor.setFontSize(`${conf.font_size}px`);
            editor.getSession().setUseWrapMode(conf.wrap_mode);

            return editor;
        }
        return null;
    }
};
window["env"] = EditorEnv;

export const ACE_THEME = [
    "ambiance",
    "chaos",
    "chrome",
    "clouds",
    "clouds_midnight",
    "cobalt",
    "crimson_editor",
    "dawn",
    "dracula",
    "dreamweaver",
    "eclipse",
    "github",
    "gob",
    "gruvbox",
    "idle_fingers",
    "iplastic",
    "katzenmilch",
    "kr_theme",
    "kuroir",
    "merbivore",
    "merbivore_soft",
    "mono_industrial",
    "monokai",
    "nord_dark",
    "pastel_on_dark",
    "solarized_dark",
    "solarized_light",
    "sqlserver",
    "terminal",
    "textmate",
    "tomorrow",
    "tomorrow_night",
    "tomorrow_night_blue",
    "tomorrow_night_bright",
    "tomorrow_night_eighties",
    "twilight",
    "vibrant_ink",
    "xcode",
]