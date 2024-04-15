import { dialog, ipcMain } from "electron/main";
import { AppUtils } from "./app_utils";
import fs from 'fs';
import { ProtocolObjectIPCResponse, ProtocolObjectProjectConfig } from "./protocol_dist";
import { execSync } from "child_process";

export class IPCS {
    static Init() {
        ipcMain.handle("FF:LocatDir", this._LocatDir);
        ipcMain.handle("FF:OpenApp", this._OpenApp);
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
    protected static async _OpenApp(_) {
        const { canceled, filePaths } = await dialog.showOpenDialog(null!, {
            properties: ['openFile', 'openDirectory']
        });
        if (!canceled) {
            return await AppUtils.OpenAppPath(filePaths[0])
        }

        return [];
    }
};  