import { RegClass } from "../../core/serialize";
import PrefabStr from "./box_project.prefab.html?raw"
import EditorEnv from "../../env";
import { ProtocolFactory, ProtocolObjectEditorConfig, ProtocolObjectIPCResponse, ProtocolObjectProjectConfig } from "../../protocol_dist";
import Prefab from "../../core/prefab";
import ProjectItem from "./project_item";
import BoxNewProject from "./box_new_project";
import Utils from "../../core/utils";
import { AppNode } from "../../core/app_node";
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
        this.subject.emit("open", conf);
        this.dispose();
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
        panel.subject.on("submit", (conf: ProtocolObjectProjectConfig) => {
            this.createProject(conf);
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
    onClickLoad() {
        console.log("load");
    }
    onEditSearch() {
        console.log("val:", this.ebSearch.value);
    }
    static get PrefabStr() {
        return PrefabStr;
    }
};