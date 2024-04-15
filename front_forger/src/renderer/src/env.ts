import { ProtocolObjectEditorConfig } from "./protocol_dist";

export default class EditorEnv {
    static _EditorConfig: ProtocolObjectEditorConfig = null;

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
};