import { ProtocolObjectEditorConfig, ProtocolObjectProjectConfig } from "./protocol_dist";

export default class EditorEnv {
    protected static _EditorConfig: ProtocolObjectEditorConfig = null;

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
    static GetProjectConfig() {
        return this._ProjectConfig;
    }
    static SetProjectConfig(config: ProtocolObjectProjectConfig) {
        return this._ProjectConfig = config;
    }
};