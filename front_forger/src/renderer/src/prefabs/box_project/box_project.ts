import { RegClass } from "../../core/serialize";
import PrefabStr from "./box_project.prefab.html?raw"
import EditorEnv from "../../env";
import { ProtocolFactory, ProtocolObjectEditorConfig, ProtocolObjectIPCResponse, ProtocolObjectOpenProject, ProtocolObjectProjectConfig } from "../../../../classes/protocol_dist";
import Prefab from "../../core/prefab";
import ProjectItem from "./project_item";
import BoxNewProject from "./box_new_project";
import Utils from "../../core/utils";
import { AppNode } from "../../core/app_node";
import { utimesSync } from "fs";
@RegClass("BoxProject")
export default class BoxProject extends AppNode {
    ebSearch: HTMLInputElement = null;
    projectContain: HTMLDivElement = null;
    editorConfig: ProtocolObjectEditorConfig = null;
    itemCol: { [key: string]: ProjectItem } = {};
    async onLoad() {
        super.onLoad && super.onLoad();
        this.editorConfig = await EditorEnv.GetEditorConfig();
        this.refresh();
    }
    refresh() {
        this.itemCol = {};
        this.disposeAllChildren(this.projectContain);
        for (let i = 0; i < this.editorConfig.project_configs.length; i++) {
            let conf = this.editorConfig.project_configs[i];
            let item = Prefab.Instantiate(ProjectItem);
            this.addChild(item, this.projectContain);
            item.setData(conf);
            item.subject.on("del", this.onClickItemDel, this);
            item.subject.on("open", this.onClickItemOpen, this);
            this.itemCol[conf.app_name] = item;
        }
    }
    async onClickItemOpen(conf: ProtocolObjectProjectConfig) {
        let msg = new ProtocolObjectOpenProject();
        msg.project_conf = conf;
        EditorEnv.postMessageExceptSelf(msg);

        this.dispose();
        window.close();
    }
    async onClickItemDel(conf: ProtocolObjectProjectConfig) {
        if (!await Utils.app.msgBoxYesNo("确认删除项目吗？文件不会被删除")) {
            return;
        }
        if (this.itemCol[conf.app_name]) {
            this.itemCol[conf.app_name].dispose();
            delete this.itemCol[conf.app_name];
            let foundInd = this.editorConfig.project_configs.findIndex(ele => ele.app_name === conf.app_name);
            if (-1 !== foundInd) {
                this.editorConfig.project_configs.splice(foundInd, 1);
            }
            EditorEnv.SaveEditorConfig();
        }
    }
    onClickNew() {
        let panel = Prefab.Instantiate(BoxNewProject);
        Utils.scene.addChild(panel);
        panel.subject.on("submit", async (conf: ProtocolObjectProjectConfig) => {
            Utils.app.blocker.ref++;
            await this.createProject(conf);
            Utils.app.blocker.ref--;
        }, this);
    }
    async createProject(conf: ProtocolObjectProjectConfig) {
        //创建文件夹
        let rsp = <ProtocolObjectIPCResponse>ProtocolFactory.CreateFromMixed(await window.electron.ipcRenderer.invoke('FF:CreateNewProjectDir', conf.toMixed()));
        if (rsp.ret) {
            Utils.app.msgBox(rsp.msg, "错误");
            return;
        }
        //记录数据
        this.editorConfig.project_configs.push(conf);
        this.refresh();
        EditorEnv.SaveEditorConfig();
    }
    async onClickLoad() {
        let path = await window.electron.ipcRenderer.invoke('FF:LocatDir');
        if (!path) {
            return;
        }
        console.log("load", path);
        let conf = new ProtocolObjectProjectConfig();
        let confJson = await window.electron.ipcRenderer.invoke('FF:LoadProjectDir', path);
        if (!confJson) {
            Utils.app.msgBox("找不到项目配置（front_forge_project.json），请确保项目路径正确");
            return;
        }
        conf.fromMixed(confJson);

        //记录数据
        this.editorConfig.project_configs.push(conf);
        this.refresh();
        EditorEnv.SaveEditorConfig();

    }
    onEditSearch() {
        console.log("val:", this.ebSearch.value);
        for (let key in this.itemCol) {
            if (key.match(this.ebSearch.value)) {
                this.itemCol[key].unblur();
            }
            else {
                this.itemCol[key].blur();
            }
        }
    }
    static get PrefabStr() {
        return PrefabStr;
    }
};