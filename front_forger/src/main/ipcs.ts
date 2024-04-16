import { dialog, ipcMain } from "electron/main";
import fs from 'fs';
import { ProtocolObjectIPCResponse, ProtocolObjectProjectConfig } from "./protocol_dist";
import { execSync } from "child_process";
import ActionExec from "./action_exec";
import { ProjectUtils } from "./project_utils";
import { DirentHandle } from "../classes/dirent_handle";

export class IPCS {
    static Init() {
        ipcMain.handle("FF:LocatDir", this._LocatDir);
        ipcMain.handle("FF:ListDir", this._ListDir);

        ipcMain.handle("FF:CreateNewProjectDir", this._CreateNewProjectDir);
        ipcMain.handle("FF:ReadEditorConfig", this._ReadEditorConfig);
        ipcMain.handle("FF:SaveEditorConfig", this._SaveEditorConfig);
    }
    private static async __CopyFile(p1, p2) {
        let copyStatment = `xcopy /y /c /s /h /r ` + `${p1} ${p2} `.replaceAll("./", "").replaceAll("/", "\\");
        await execSync(copyStatment);
    }
    private static async __FileContentReplaceKey(path: string, ...pairs: [string, string][]) {
        let str = await fs.readFileSync(path).toString();
        for (let i = 0; i < pairs.length; i++) {
            let pair = pairs[i];
            str = str.replace(pair[0], pair[1]);
        }
        await fs.writeFileSync(path, str);
    }
    private static __GetNameByPath(path: string) {
        let i1 = path.lastIndexOf("/");
        let i2 = path.lastIndexOf("\\");
        if( i1 === -1 && i2 === -1 ){ 
            console.warn("__GetNameByPath, warn:", path);
            return path;
        }
        if( i1 > i2 ){ 
            return path.substring( i1 + 1 );
        }
        else {
            return path.substring( i2 + 1 );
        }
    }
    protected static async _ListDir(_, path: string) {
        let dh = new DirentHandle();
        dh.isDir = true;
        dh.path = path;
        dh.name = IPCS.__GetNameByPath(path);
        await ProjectUtils.ListDir(path + "/", dh);
        return dh;
    }
    protected static async _CreateNewProjectDir(_, json: JSON) {
        let rsp = new ProtocolObjectIPCResponse();
        let conf = new ProtocolObjectProjectConfig();
        console.log("json:", json);
        conf.fromMixed(json);
        console.log(`创建新项目${conf.app_name}在文件夹${conf.path}`);

        if (fs.existsSync(conf.path)) {
            rsp.ret = 1;
            rsp.msg = "文件夹已存在";
        }
        fs.mkdirSync(conf.path);

        const TEMPLATE_DIR = "./resources/template-project-default/";
        const PROJ_DIR = conf.path;

        await IPCS.__CopyFile(`"${TEMPLATE_DIR}*.*"`, `"${PROJ_DIR}\\"`);
        await fs.writeFileSync(`${PROJ_DIR}/front_forge_project.json`, JSON.stringify(conf.toField()));
        await IPCS.__FileContentReplaceKey(`${PROJ_DIR}/src/core/macro.ts`, ["{{APP_NAME}}", conf.app_name]);
        let ae = new ActionExec(`${PROJ_DIR}`);
        ae.onData = (str: string, delta: string) => {
            console.log(delta);
        };
        await ae.cmd("npm.cmd", ["install"]);
        return rsp.toMixed();
    }
    protected static async _ReadEditorConfig(_) {
        return JSON.parse(fs.readFileSync("./resources/editor_config.json").toString());
    }
    protected static async _SaveEditorConfig(_, config: JSON) {
        // console.log(_, config);
        fs.writeFileSync("./resources/editor_config.json", JSON.stringify(config));
        return true;
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