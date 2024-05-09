import Panel from "../../../core/prefabs/panel";
import { RegClass } from "../../../core/serialize";
import Utils from "../../../core/utils";
import EditorEnv from "../../../env";
import PrefabStr from "./box_project_setting.prefab.html?raw"
@RegClass("BoxProjectSetting")
export default class BoxProjectSetting extends Panel {
    ebDevDomain: HTMLInputElement = null;
    ebDevPath: HTMLInputElement = null;
    ebResDomain: HTMLInputElement = null;
    ebResPath: HTMLInputElement = null;

    onLoad(): void {
        this.refresh();
    }
    refresh() {
        let projConf = EditorEnv.GetProjectConfig();
        this.ebDevDomain.value = projConf.compile_dev.server_domain;
        this.ebDevPath.value = projConf.compile_dev.server_path;
        this.ebResDomain.value = projConf.compile_res.server_domain;
        this.ebResPath.value = projConf.compile_res.server_path;
    }

    onClickReset() {
        this.refresh();
    }
    async onClickSave() {
        let projConf = EditorEnv.GetProjectConfig();
        projConf.compile_dev.server_domain = this.ebDevDomain.value;
        projConf.compile_dev.server_path = this.ebDevPath.value;
        projConf.compile_res.server_domain = this.ebResDomain.value;
        projConf.compile_res.server_path = this.ebResPath.value;
        await EditorEnv.SetProjectConfig(projConf);

        Utils.scene.toast("保存成功");
    }

    static get PrefabStr() {
        return PrefabStr;
    }
};