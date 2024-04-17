import { Menu, MenuItem, dialog, globalShortcut, ipcMain } from "electron/main";
import fs from 'fs';
import { ProtocolObjectIPCResponse, ProtocolObjectProjectConfig } from "./protocol_dist";
import { execSync } from "child_process";
import ActionExec from "./action_exec";
import { ProjectUtils } from "./project_utils";
import { DirentHandle } from "../classes/dirent_handle";
import Utils from "./utils";
import { BrowserWindow, shell } from "electron";

export class IPCS {
    static mainWindow: BrowserWindow = null!;
    static Init(mainWindow: BrowserWindow) {
        IPCS.mainWindow = mainWindow;
        //弹出文件夹选择框，返回路径
        ipcMain.handle("FF:LocatDir", IPCS._LocatDir);
        //遍历文件文件夹，返回DH
        ipcMain.handle("FF:ListDir", IPCS._ListDir);
        //资源管理器打开文件夹
        ipcMain.handle("FF:OpenDir", IPCS._OpenDir);
        //获取某个文件的DH
        ipcMain.handle("FF:GetDirentHandle", IPCS._GetDirentHandle);

        //新建prefab资源
        ipcMain.handle("FF:NewPrefabAsset", IPCS._NewPrefabAsset);
        //创建新项目
        ipcMain.handle("FF:CreateNewProjectDir", IPCS._CreateNewProjectDir);
        //载入项目
        ipcMain.handle("FF:LoadProjectDir", IPCS._LoadProjectDir);

        //编辑器数据
        ipcMain.handle("FF:ReadEditorConfig", IPCS._ReadEditorConfig);
        ipcMain.handle("FF:SaveEditorConfig", IPCS._SaveEditorConfig);

        //项目数据
        ipcMain.handle("FF:ReadProjectConfig", IPCS._ReadProjectConfig);
        ipcMain.handle("FF:SaveProjectConfig", IPCS._SaveProjectConfig);

        //读取，保存文件
        ipcMain.handle("FF:ReadStrFile", IPCS._ReadStrFile);
        ipcMain.handle("FF:SaveStrFile", IPCS._SaveStrFile);
        //删除文件
        ipcMain.handle("FF:DeleteFile", IPCS._DeleteFile);

        //运行
        ipcMain.handle("FF:RunProject", IPCS._RunProject);
        ipcMain.handle("FF:StopProject", IPCS._StopProject);

        //控制窗口大小
        ipcMain.handle("FF:ResizeWindow", IPCS._ResizeWindow);

        //外部浏览器打开链接
        ipcMain.handle("FF:OpenURL", IPCS._OpenURL);
    }
    protected static _ResizeWindow(_, width: number, height: number) {
        IPCS.mainWindow.setSize(width, height, true);
    }
    private static __ae: ActionExec = null!;
    protected static async _RunProject(_, projDat: JSON) {
        let projConf = new ProtocolObjectProjectConfig();
        projConf.fromMixed(projDat);
        IPCS.__ae = new ActionExec(projConf.path);
        let port = (3000 + Math.random() * 9999).toFixed(0);
        IPCS.__ae.cmd("npx.cmd", ["vite", "--port", port]);
        IPCS.__ae.onData = (str: string, delta: string) => {
            IPCS.mainWindow.webContents.send("log", delta);
        };

        let prefabConf = projConf.prefabs_list.find(ele => ele.name === projConf.entrance_prefab_name)!;
        let prefabPath = "./prefabs/" + prefabConf.name;
        //覆盖MAIN.ts
        const TEMPLATE_PATH = "./resources/template-main.ts";
        const MAIN_PATH = projConf.path + "/src/main.ts";
        await IPCS.__CopyFile(`"${TEMPLATE_PATH}"`, `"${MAIN_PATH}"`);
        await IPCS.__FileContentReplaceKey(`${MAIN_PATH}`,
            ["{{PATH}}", prefabPath],
            ["{{CLASS_NAME_BIG}}", Utils.SnakeToPascal(prefabConf.name)]
        );
        return port;
    }
    protected static async _StopProject(_) {
        // let projConf = new ProtocolObjectProjectConfig();
        // projConf.fromMixed(projDat);
        if (IPCS.__ae) {
            IPCS.__ae.kill();
            IPCS.__ae = null!;
        }
    }
    private static async __CopyFile(p1, p2) {
        let copyStatment = `echo f| xcopy /y /c /s /h /r ` + `${p1} ${p2} `.replaceAll("./", "").replaceAll("/", "\\");
        await execSync(copyStatment);
    }
    private static async __FileContentReplaceKey(path: string, ...pairs: [string, string][]) {
        let str = await fs.readFileSync(path).toString();
        for (let i = 0; i < pairs.length; i++) {
            let pair = pairs[i];
            str = str.replaceAll(pair[0], pair[1]);
        }
        await fs.writeFileSync(path, str);
    }
    protected static async _NewPrefabAsset(_, name: string, projDat: JSON) {
        let projConf = new ProtocolObjectProjectConfig();
        projConf.fromMixed(projDat);
        // 新建文件
        const TEMPLATE_DIR = "./resources/template-prefab/";
        const DST_DIR = projConf.path + `src\\prefabs\\`;

        let rtn = new ProtocolObjectIPCResponse();
        try {
            await IPCS.__CopyFile(`"${TEMPLATE_DIR}_.ts"`, `"${DST_DIR}${name}.ts"`);
            await IPCS.__CopyFile(`"${TEMPLATE_DIR}_.prefab.html"`, `"${DST_DIR}${name}.prefab.html"`);
            await IPCS.__FileContentReplaceKey(`${DST_DIR}${name}.ts`, ["{{CLASS_NAME}}", name], ["{{CLASS_NAME_BIG}}", Utils.SnakeToPascal(name)]);
        }
        catch (e) {
            rtn.ret = 1;
            rtn.msg = "新建文件失败";
        }
        return rtn;
    }
    protected static async _GetDirentHandle(_, path: string) {
        return await ProjectUtils.GetDirentHandle(path);
    }
    protected static async _OpenURL(_, url: string) {
        shell.openExternal(url);
    }
    protected static async _OpenDir(_, path: string) {
        shell.openPath(path);
    }
    protected static async _ListDir(_, path: string) {
        let dh = new DirentHandle();
        dh.isDir = true;
        dh.path = path;
        dh.name = ProjectUtils.GetNameByPath(path);
        await ProjectUtils.ListDir(path + "/", dh);
        return dh;
    }
    protected static async _LoadProjectDir(_, path: string) {
        let projConf = new ProtocolObjectProjectConfig();
        let confPath = path + "/" + "front_forge_project.json";
        if (!fs.existsSync(confPath)) {
            return null;
        }
        else {
            projConf.fromMixed(JSON.parse(fs.readFileSync(confPath).toString()));
            return projConf;
        }
    }
    protected static async _CreateNewProjectDir(_, projDat: JSON) {
        let rsp = new ProtocolObjectIPCResponse();
        let projConf = new ProtocolObjectProjectConfig();
        projConf.fromMixed(projDat);
        // console.log(`创建新项目${projConf.app_name}在文件夹${projConf.path}`);

        if (fs.existsSync(projConf.path)) {
            rsp.ret = 1;
            rsp.msg = "文件夹已存在";
        }
        fs.mkdirSync(projConf.path);

        const TEMPLATE_DIR = "./resources/template-project-default/";
        const PROJ_DIR = projConf.path;

        await IPCS.__CopyFile(`"${TEMPLATE_DIR}*.*"`, `"${PROJ_DIR}\\"`);
        await fs.writeFileSync(`${PROJ_DIR}/front_forge_project.json`, JSON.stringify(projConf.toField()));
        await IPCS.__FileContentReplaceKey(`${PROJ_DIR}/src/core/macro.ts`, ["{{APP_NAME}}", projConf.app_name]);
        let ae = new ActionExec(`${PROJ_DIR}`);
        await ae.cmd("npm.cmd", ["install"]);
        return rsp.toMixed();
    }
    protected static async _ReadProjectConfig(_, path: string) {
        let confPath = path + "/" + "front_forge_project.json";
        return JSON.parse(await IPCS._ReadStrFile(_, confPath));
    }
    protected static async _SaveProjectConfig(_, config: JSON) {
        let projConf = new ProtocolObjectProjectConfig();
        projConf.fromMixed(config);
        let confPath = projConf.path + "/" + "front_forge_project.json";
        await IPCS._SaveStrFile(_, confPath, JSON.stringify(config));
        return true;
    }

    protected static async _ReadEditorConfig(_) {
        return JSON.parse(await IPCS._ReadStrFile(_, "./resources/editor_config.json"));
    }
    protected static async _SaveEditorConfig(_, config: JSON) {
        // console.log(_, config);
        return await IPCS._SaveStrFile(_, "./resources/editor_config.json", JSON.stringify(config))
    }

    protected static async _ReadStrFile(_, path: string) {
        if (!fs.existsSync(path)) {
            return "";
        }
        else {
            return fs.readFileSync(path).toString();
        }
    }
    protected static async _SaveStrFile(_, path: string, dat: string) {
        fs.writeFileSync(path, dat);
        return true;
    }

    protected static async _DeleteFile(_, path: string) {
        if (fs.existsSync(path)) {
            fs.rmSync(path);
            return true;
        }
        return false;
    }

    protected static async _LocatDir(_) {
        const { canceled, filePaths } = await dialog.showOpenDialog(null!, {
            properties: ['openFile', 'openDirectory']
        });
        if (!canceled) {
            return filePaths[0];
        }

        return "";
    }
};  