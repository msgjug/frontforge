import Panel from "../../core/prefabs/panel";
import { RegClass } from "../../core/serialize";
import { ProtocolObjectProjectConfig } from "../../../../classes/protocol_dist";
import PrefabStr from "./box_new_project.prefab.html?raw"
import EditorEnv from "../../env";
@RegClass("BoxNewProject")
export default class BoxNewProject extends Panel {
    ebName: HTMLInputElement = null;
    ebDesc: HTMLInputElement = null;
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

        let projName = this.ebName.value; //1.3.7 项目名字不再与项目文件夹绑定
        let projPath = this.ebPath.value; //1.3.7 新建项目时路径指向项目而不是项目上级目录 // + `\\${projName}\\`;
        let projDesc = this.ebDesc.value; //1.3.7 新增desc

        let projectConfig = new ProtocolObjectProjectConfig();
        projectConfig.app_desc = projDesc;
        projectConfig.app_name = projName;
        projectConfig.app_version = "2.1";
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