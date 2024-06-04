import Prefab from "../../../core/prefab";
import Panel from "../../../core/prefabs/panel";
import { RegClass } from "../../../core/serialize";
import Utils from "../../../core/utils";
import EditorEnv from "../../../env";
import PrefabStr from "./box_project_setting.prefab.html?raw"
import ProjectIndexAssetItem from "./project_index_asset_item";
@RegClass("BoxProjectSetting")
export default class BoxProjectSetting extends Panel {
    ebDevDomain: HTMLInputElement = null;
    ebDevPath: HTMLInputElement = null;
    ebResDomain: HTMLInputElement = null;
    ebResPath: HTMLInputElement = null;

    // index_asset_contain_dev: HTMLDivElement = null;
    // index_asset_contain_res: HTMLDivElement = null;
    // devAssetItems: ProjectIndexAssetItem[] = [];
    // resAssetItems: ProjectIndexAssetItem[] = [];
    onLoad(): void {
        this.refresh();
    }
    refresh() {
        let projConf = EditorEnv.GetProjectConfig();
        this.ebDevDomain.value = projConf.compile_dev.server_domain;
        this.ebDevPath.value = projConf.compile_dev.server_path;
        this.ebResDomain.value = projConf.compile_res.server_domain;
        this.ebResPath.value = projConf.compile_res.server_path;

        // this.disposeAllChildren(this.index_asset_contain_dev);
        // this.disposeAllChildren(this.index_asset_contain_res);
        // this.devAssetItems = [];
        // this.resAssetItems = [];
        // projConf.index_asset_dev.list.forEach(str => {
        //     let item = Prefab.Instantiate(ProjectIndexAssetItem);
        //     item.eb.value = str;
        //     this.addChild(item, this.index_asset_contain_dev);
        //     this.devAssetItems.push(item);
        //     item.subject.on("del", this.onClickDelIndexAsset, this);
        //     item.subject.on("edit", this.onEditIndexAsset, this);
        // });
        // projConf.index_asset_res.list.forEach(str => {
        //     let item = Prefab.Instantiate(ProjectIndexAssetItem);
        //     item.eb.value = str;
        //     this.addChild(item, this.index_asset_contain_res);
        //     this.resAssetItems.push(item);
        //     item.subject.on("del", this.onClickDelIndexAsset, this);
        //     item.subject.on("edit", this.onEditIndexAsset, this);
        // });
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


    // onClickDelIndexAsset(item: ProjectIndexAssetItem) {
    //     let type = "dev";
    //     let ind = this.devAssetItems.findIndex(ele => ele == item);
    //     if (-1 === ind) {
    //         type = "res";
    //         this.resAssetItems.findIndex(ele => ele == item);
    //     }

    //     let projConf = EditorEnv.GetProjectConfig();
    //     projConf[`index_asset_${type}`].list.splice(ind, 1);
    //     item.dispose();
    // }
    // onEditIndexAsset(item: ProjectIndexAssetItem) {
    //     let type = "dev";
    //     let ind = this.devAssetItems.findIndex(ele => ele == item);
    //     if (-1 === ind) {
    //         type = "res";
    //         this.resAssetItems.findIndex(ele => ele == item);
    //     }

    //     let projConf = EditorEnv.GetProjectConfig();
    //     projConf[`index_asset_${type}`].list[ind] = item.eb.value;
    // }

    // onClickAddAsset(type: string) {
    //     let projConf = EditorEnv.GetProjectConfig();
    //     switch (type) {
    //         case "dev":
    //             projConf.index_asset_dev.list.push("");
    //             break;
    //         case "res":
    //             projConf.index_asset_res.list.push("");
    //             break;
    //     }

    //     this.refresh();
    // }

};