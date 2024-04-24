import Panel from "../../core/prefabs/panel";
import { RegClass } from "../../core/serialize";
import { ProtocolObjectProjectConfig } from "../../../../classes/protocol_dist";
import PrefabStr from "./box_new_project.prefab.html?raw"
import EditorEnv from "../../env";
@RegClass("BoxNewProject")
export default class BoxNewProject extends Panel {
    ebName: HTMLInputElement = null;
    ebPath: HTMLInputElement = null;
    async onLoad() {
        super.onLoad && super.onLoad();

        this.ebPath.value = (await EditorEnv.GetEditorConfig()).project_dir;
    }
    onClickSubmit() {
        if (!this.ebName.value) {
            return;
        }
        if (!this.ebPath.value) {
            return;
        }

        let projName = this.ebName.value;
        let projPath = this.ebPath.value + `\\${projName}\\`;

        let projectConfig = new ProtocolObjectProjectConfig();
        projectConfig.app_name = projName;
        projectConfig.app_version = "2.0";
        projectConfig.path = projPath;
        this.subject.emit("submit", projectConfig);
        this.dispose();
    }

    async onClickLocation() {
        this.ebPath.value = await window.electron.ipcRenderer.invoke('FF:LocatDir');
    }
    static get PrefabStr() {
        return PrefabStr;
    }
};