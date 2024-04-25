import { dialog, ipcMain } from "electron/main";
import fs from 'fs';
import { ProtocolObjectIPCResponse, ProtocolObjectPrefabConfig, ProtocolObjectProjectConfig, ProtocolObjectWindowChange } from "../classes/protocol_dist";
import { execSync } from "child_process";
import ActionExec from "./action_exec";
import { ProjectUtils } from "./project_utils";
import { DirentHandle } from "../classes/dirent_handle";
import Utils from "./utils";
import { app, BrowserWindow, Menu, MenuItem, shell } from "electron";
import path, { join } from "path";
import icon from "../../resources/icon.png?asset"
import { is } from "@electron-toolkit/utils";
import { ProtocolObjectEditorConfig } from "../classes/protocol_dist";
import { WindowHandle } from "../classes/window_handle";
import compressing from 'compressing'

// 假设你需要获取一个名为 "myUnpackedResource" 的文件
const TEMPLATE_MAIN_TS = Utils.GetResourcePath('template/template-main.ts');

const EDITOR_CONFIG_PATH = path.join(process.cwd(), "resources/editor_config.json");

//主进程逻辑
export class IPCS {
    //主界面
    static mainWindow: BrowserWindow = null!;
    //代码窗口
    static codeWindow: BrowserWindow = null!;
    //所有窗口集合 handle{ name: win: }
    static windows: WindowHandle[] = [];
    //创建窗口。
    /**
     * 
     * @param name 索引KEY
     * @param x 
     * @param y 
     * @param width 
     * @param height 
     * @param ps 索引到页面。在renderer 的 nav.ts 和 main.ts 中有相应的逻辑
     * @param box 弹窗。在renderer 的 nav.ts 和 main.ts 中有相应的逻辑
     * @param modal 模态，填写父窗口名字，如果为空则非模态
     * @param child 填写父窗口名字，如果为空则没有父窗口
     * @param resizable 是否可以改变大小
     * @returns 
     */
    private static _createWindow(name: string, x: number, y: number, width: number, height: number, ps = "none", box = "none", modal = "", child = "", resizable = false) {
        // Create the browser window.
        let parent: BrowserWindow = null!;
        if (modal !== "") {
            parent = IPCS.windows.find(ele => ele.name === modal).win;
        }
        if (child !== "") {
            parent = IPCS.windows.find(ele => ele.name === child).win;
        }
        const win = new BrowserWindow({
            x: x,
            y: y,
            width: width,
            height: height,
            show: false,
            frame: false,
            modal: modal !== "",
            resizable: resizable,
            parent: parent,
            autoHideMenuBar: true,
            ...(process.platform === 'linux' ? { icon } : {}),
            webPreferences: {
                preload: join(__dirname, '../preload/index.js'),
                sandbox: false,
                // webSecurity: false,
            }
        });

        win.webContents.setWindowOpenHandler((details) => {
            // const win = IPCS._createWindow(400, 400, "none", details.url);
            // win.setWindowButtonVisibility(false);
            // return {
            //     action: "allow", overrideBrowserWindowOptions: {
            //         autoHideMenuBar: true,
            //     }
            // };
            shell.openExternal(details.url)
            return { action: 'deny' }
        })

        // HMR for renderer base on electron-vite cli.
        // Load the remote URL for development or the local html file for production.
        if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
            win.loadURL(process.env['ELECTRON_RENDERER_URL'] + `?ps=${ps}&box=${box}`);
        } else {
            win.loadFile(join(__dirname, `../renderer/index.html`), {
                query: { ps, box }
            });
        }

        let wh = new WindowHandle();
        wh.name = name;
        wh.win = win;
        IPCS.windows.push(wh);

        let msg = new ProtocolObjectWindowChange();
        msg.open = name;
        let wcs: Electron.WebContents[] = [];
        IPCS.windows.forEach(wh => {
            wcs.push(wh.win.webContents);
        });
        IPCS.Broadcast(wcs, msg.toMixed());

        win.once("close", () => {
            IPCS._onWindowDestroy(wh.name);
        });
        if (modal !== "") {
            let { x: topX, y: topY, width: topWidth, height: topHeight } = parent.getBounds();
            let { width: sonWidth, height: sonHeight } = win.getBounds();
            let x = topX + (topWidth - sonWidth) / 2;
            let y = topY + (topHeight - sonHeight) / 2;
            win.setPosition(x, y)
        }
        return win;
    }
    static _onWindowDestroy(name: string) {
        let foundInd = IPCS.windows.findIndex(ele => ele.name === name);
        let wh = IPCS.windows[foundInd];

        if (foundInd !== -1) {
            IPCS.windows.splice(foundInd, 1);
        }
        if (wh) {
            if (IPCS.codeWindow == wh.win) {
                IPCS.codeWindow = null!;
            }
            if (IPCS.mainWindow === wh.win) {
                IPCS.mainWindow = null!;
                IPCS._Quit(null);
            }

            let msg = new ProtocolObjectWindowChange();
            msg.close = wh.name;
            let wcs: Electron.WebContents[] = [];
            IPCS.windows.forEach(wh => {
                wcs.push(wh.win.webContents);
            });
            IPCS.Broadcast(wcs, msg.toMixed());
        }
    }
    static editorConfig: ProtocolObjectEditorConfig = new ProtocolObjectEditorConfig();

    //更新窗口状态 
    protected static async _refreshWindowState() {
        if (IPCS.editorConfig.win_main) {
            IPCS.mainWindow.show();
        }
        else {
            IPCS.mainWindow.hide();
        }

        let pos = IPCS.mainWindow.getPosition();
        if (IPCS.codeWindow) {
            if (IPCS.editorConfig.win_code) {
                IPCS.codeWindow.show();
                IPCS.codeWindow.setPosition(pos[0] + IPCS.editorConfig.win_main_w, pos[1]);
            }
            else {
                IPCS.codeWindow.hide();
            }
        }
        else {
            if (IPCS.editorConfig.win_code) {
                IPCS.codeWindow = IPCS._createWindow("code", pos[0] + IPCS.editorConfig.win_main_w, pos[1], IPCS.editorConfig.win_code_w, IPCS.editorConfig.win_code_h, "code", "none", "", "main", true);
                IPCS.codeWindow.once("ready-to-show", () => IPCS.codeWindow.show());
                IPCS.InitHotKey(IPCS.codeWindow);
            }
            else {
            }
        }
    }

    //快捷键
    static async InitHotKey(win: BrowserWindow) {
        const menu = new Menu()
        menu.append(new MenuItem({
            label: 'Hotkey',
            submenu: [{
                role: 'help',
                accelerator: process.platform === 'darwin' ? 'Cmd+S' : 'Control+S',
                click: () => {
                    win.webContents.send("hot-key", "save")
                }
            }, {
                role: 'help',
                accelerator: process.platform === 'darwin' ? 'Cmd+N' : 'Control+N',
                click: () => {
                    win.webContents.send("hot-key", "new")
                }
            }, {
                role: 'help',
                accelerator: 'F5',
                click: () => {
                    win.webContents.send("hot-key", "run")
                }
            }, {
                role: 'help',
                accelerator: 'ESC',
                click: () => {
                    win.webContents.send("hot-key", "esc")
                }
            }]
        }))
        Menu.setApplicationMenu(menu)
    }
    static async Init() {
        //读取EDITOR配置
        await IPCS._ReadEditorConfig(null);
        //创建MAIN窗口，并居中，加入快捷键
        IPCS.mainWindow = IPCS._createWindow("main", 0, 0, IPCS.editorConfig.win_main_w, IPCS.editorConfig.win_main_h, "index");
        IPCS.mainWindow.center();
        IPCS.InitHotKey(IPCS.mainWindow);
        //CODE窗口跟随MAIN
        IPCS.mainWindow.on("move", () => {
            if (IPCS.codeWindow && IPCS.codeWindow.isVisible()) {
                let srcSize = IPCS.codeWindow.getSize();
                let pos = IPCS.mainWindow.getPosition();
                IPCS.codeWindow.setPosition(pos[0] + IPCS.editorConfig.win_main_w, pos[1]);

                // 设置SETPOSITION 后，尺寸变了，是超分辨率的问题。
                IPCS.codeWindow.setSize(srcSize[0], srcSize[1]);
            }
        })

        //刷新窗口
        IPCS._refreshWindowState();


        //发送消息
        // 分发消息
        ipcMain.on("FF:Message", IPCS._OnMessage);

        //检查文件/文件夹是否存在
        ipcMain.handle("FF:FileExist", IPCS._FileExist);

        ipcMain.handle("FF:MsgBox", IPCS._MsgBox);
        //检查项目文件夹是否健康，是否有缺少东西
        ipcMain.handle("FF:CheckProjectDir", IPCS._CheckProjectDir);
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

        //构建
        ipcMain.handle("FF:BuildProject", IPCS._BuildProject);

        //外部浏览器打开链接
        ipcMain.handle("FF:OpenURL", IPCS._OpenURL);

        //新建窗口
        ipcMain.handle("FF:CreateWindow", IPCS._CreateWindow);

        //退出
        ipcMain.handle("FF:Quit", IPCS._Quit);

    }
    // 退出程序
    protected static _Quit(_) {
        if (IPCS.__ae) {
            IPCS.__ae.kill();
            IPCS.__ae = null;
        }
        app.quit();
    }
    // 检查项目文件夹 是否健康，
    /**
     * 
     * @param _ 
     * @param path 项目地址
     * @returns {ProtocolObjectIPCResponse}
     */
    protected static _CheckProjectDir(_, path: string) {
        let rtn = new ProtocolObjectIPCResponse();
        //检查是否有front_forge_project.json
        rtn.ret = fs.existsSync(path + "/" + "front_forge_project.json") ? 0 : 1;
        return rtn;
    }
    //text内容，parentName 父窗口名字
    protected static _MsgBox(_, text: string, parentName = "") {
        let parent = null;
        if (parentName) {
            parent = IPCS.windows.find(ele => ele.name === parentName);
        }
        dialog.showMessageBoxSync(parent, {
            title: "消息",
            message: text
        });
    }
    /**
     * 
     * @param _ 
     * @param path 文件/文件夹路径
     * @returns 
     */
    protected static _FileExist(_, path: string) {
        let rtn = new ProtocolObjectIPCResponse();
        rtn.ret = fs.existsSync(path) ? 0 : 1;
        return rtn;
    }
    /**
     * 发送消息     
     * @param _ 
     * @param msg 消息
     * @param exceptSelf 是否不发送给自己
     */
    protected static _OnMessage(_, msg: JSON, exceptSelf = false) {
        let wcs: Electron.WebContents[] = [];
        if (exceptSelf) {
            IPCS.windows.forEach(wh => {
                if (wh.win.webContents != _.sender) {
                    wcs.push(wh.win.webContents);
                }
            });
        }
        else {
            IPCS.windows.forEach(wh => {
                wcs.push(wh.win.webContents);
            });
        }
        IPCS.Broadcast(wcs, msg);
    }
    /**
     * 分发消息给窗口
     * @param wcs WEBCONTENTS
     * @param msg json
     */
    protected static Broadcast(wcs: Electron.WebContents[], msg: JSON) {
        wcs.forEach(wc => {
            wc.send("FF:Broadcast", msg);
        });
    }
    /**
     * FF:CreateWindow实现，参数参考IPCS._createWindow
     * @param _ 
     * @param name 
     * @param x 
     * @param y 
     * @param width 
     * @param height 
     * @param page 
     * @param box 
     * @param modal 
     * @param child 
     * @returns 
     */
    protected static _CreateWindow(_, name: string, x: number, y: number, width: number, height: number, page: string, box: string, modal = "", child = "") {
        if (IPCS.windows.find(ele => ele.name === name)) {
            return;
        }
        const win = IPCS._createWindow(name, x, y, width, height, page, box, modal, child);
        win.once("ready-to-show", () => win.show());
    }
    /** 执行命令行对象 */
    private static __ae: ActionExec = null!;
    /**
     * 运行项目， (npx vite)
     * @param _ 
     * @param projDat 项目配置
     * @returns 
     */
    protected static async _RunProject(_, projDat: JSON) {
        let projConf = new ProtocolObjectProjectConfig();
        projConf.fromMixed(projDat);

        let prefabConf = projConf.prefabs_list.find(ele => ele.name === projConf.entrance_prefab_name)!;
        if (!prefabConf) {
            return "";
        }
        let prefabPath = "./prefabs/" + prefabConf.name;
        //覆盖MAIN.ts
        const MAIN_PATH = projConf.path + "/src/main.ts";
        await IPCS.__CopyFile(`"${TEMPLATE_MAIN_TS}"`, `"${MAIN_PATH}"`);
        await IPCS.__FileContentReplaceKey(`${MAIN_PATH}`,
            ["{{PATH}}", prefabPath],
            ["{{CLASS_NAME_BIG}}", Utils.SnakeToPascal(prefabConf.name)]
        );

        IPCS.__ae = new ActionExec(projConf.path);
        let port = (3000 + Math.random() * 9999).toFixed(0);
        IPCS.__ae.cmd("npx.cmd", ["vite", "--port", port]);
        IPCS.__ae.onData = (str: string, delta: string) => {
            IPCS.mainWindow.webContents.send("log", delta);
        };
        return port;
    }
    /**
     * 停止运行的项目
     * @param _ 
     */
    protected static async _StopProject(_) {
        // let projConf = new ProtocolObjectProjectConfig();
        // projConf.fromMixed(projDat);
        if (IPCS.__ae) {
            IPCS.__ae.kill();
            IPCS.__ae = null!;
        }
    }
    /**
     * 构建项目 (npx vite build)
     * @param _ 
     * @param projDat 项目配置
     * @returns 
     */
    protected static async _BuildProject(_, projDat: JSON) {
        let projConf = new ProtocolObjectProjectConfig();
        projConf.fromMixed(projDat);

        let prefabConf = projConf.prefabs_list.find(ele => ele.name === projConf.entrance_prefab_name)!;
        if (!prefabConf) {
            return "";
        }
        let prefabPath = "./prefabs/" + prefabConf.name;
        //覆盖MAIN.ts
        const MAIN_PATH = projConf.path + "/src/main.ts";
        await IPCS.__CopyFile(`"${TEMPLATE_MAIN_TS}"`, `"${MAIN_PATH}"`);
        await IPCS.__FileContentReplaceKey(`${MAIN_PATH}`,
            ["{{PATH}}", prefabPath],
            ["{{CLASS_NAME_BIG}}", Utils.SnakeToPascal(prefabConf.name)]
        );

        IPCS.__ae = new ActionExec(projConf.path);
        let port = (3000 + Math.random() * 9999).toFixed(0);
        IPCS.__ae.cmd("npx.cmd", ["vite", "build"]);
        IPCS.__ae.onData = (str: string, delta: string) => {
            IPCS.mainWindow.webContents.send("log", delta);
            console.log(delta);
        };
        return new Promise(ok => IPCS.__ae.onEnd = ok);
    }
    /** 复制文件/文件夹 */
    private static async __CopyFile(p1, p2) {
        let copyStatment = `echo f| xcopy /y /c /s /h /r ` + `${p1} ${p2} `.replaceAll("./", "").replaceAll("/", "\\");
        await execSync(copyStatment);
    }
    /**
     * 
     * @param str 文字
     * @param pairs [查找文字，替换文字][查找文字，替换文字][查找文字，替换文字]
     * @returns 
     */
    private static __StrReplace(str: string, ...pairs: [string, string][]) {
        for (let i = 0; i < pairs.length; i++) {
            let pair = pairs[i];
            str = str.replaceAll(pair[0], pair[1]);
        }
        return str;
    }
    /**
     * 读取文件，替换文字，保存文件。
     * @param path 文件路径
     * @param pairs [查找文字，替换文字][查找文字，替换文字][查找文字，替换文字]
     */
    private static async __FileContentReplaceKey(path: string, ...pairs: [string, string][]) {
        let str = await fs.readFileSync(path).toString();
        str = IPCS.__StrReplace(str, ...pairs);
        await fs.writeFileSync(path, str);
    }
    /**
     * 新建Prefab
     * @param _ 
     * @param name prefab名
     * @param projDat 
     * @returns 
     */
    protected static async _NewPrefabAsset(_, name: string, projDat: JSON) {
        let projConf = new ProtocolObjectProjectConfig();
        projConf.fromMixed(projDat);
        // 新建文件
        const TEMPLATE_DIR = Utils.GetResourcePath("template/template-prefab/");
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
    /**
     * 用路径获取DirentHandle
     * @param _ 
     * @param path 
     * @returns 
     */
    protected static async _GetDirentHandle(_, path: string) {
        return await ProjectUtils.GetDirentHandle(path);
    }

    /**
     * 用系统浏览器打开URL
     * @param _ 
     * @param url 
     */
    protected static async _OpenURL(_, url: string) {
        shell.openExternal(url);
    }
    /**
     * 用系统文件打开URL
     * @param _ 
     * @param path 
     */
    protected static async _OpenDir(_, path: string) {
        shell.openPath(path);
    }
    /**
     * 遍历文件夹，返回DirentHandle
     * @param _ 
     * @param path 
     * @returns 
     */
    protected static async _ListDir(_, path: string) {
        let dh = new DirentHandle();
        dh.isDir = true;
        dh.path = path;
        dh.name = ProjectUtils.GetNameByPath(path);
        await ProjectUtils.ListDir(path + "/", dh);
        return dh;
    }
    /**
     * 载入项目
     * @param _ 
     * @param path 
     * @returns 
     */
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
    /**
     * 新建项目
     * @param _ 
     * @param projDat 
     * @returns 
     */
    protected static async _CreateNewProjectDir(_, projDat: JSON) {
        let rsp = new ProtocolObjectIPCResponse();
        let projConf = new ProtocolObjectProjectConfig();
        projConf.fromMixed(projDat);
        
        //默认给一个page_home资源，组名pages，并设置入口
        let prefab = new ProtocolObjectPrefabConfig();
        prefab.group="pages";
        prefab.name = "page_home";
        projConf.prefabs_list.push(prefab);
        projConf.entrance_prefab_name="page_home";
        
        if (fs.existsSync(projConf.path)) {
            rsp.ret = 1;
            rsp.msg = "文件夹已存在";
        }
        fs.mkdirSync(projConf.path);

        const TEMPLATE_DIR = Utils.GetResourcePath("template/template-project-default/");
        const NODE_MODULES_PACK = Utils.GetResourcePath("template/node_modules_pack.zip");
        const PROJ_DIR = projConf.path;

        await IPCS.__CopyFile(`"${TEMPLATE_DIR}*.*"`, `"${PROJ_DIR}\\"`);
        await fs.writeFileSync(`${PROJ_DIR}/front_forge_project.json`, JSON.stringify(projConf.toField()));
        await IPCS.__FileContentReplaceKey(`${PROJ_DIR}/src/core/macro.ts`, ["{{APP_NAME}}", projConf.app_name]);

        //解压本地的node_modules_pack.zip包
        await compressing.zip.uncompress(NODE_MODULES_PACK, PROJ_DIR);

        // npm install 
        // let ae = new ActionExec(`${PROJ_DIR}`);
        // await ae.cmd("npm.cmd", ["install"]);
        return rsp.toMixed();
    }
    /**
     * 读取项目配置文件
     * @param _ 
     * @param path 项目文件夹
     * @returns 
     */
    protected static async _ReadProjectConfig(_, path: string) {
        let confPath = path + "/" + "front_forge_project.json";
        if (!fs.existsSync(confPath)) {
            return null;
        }
        let json = JSON.parse(await IPCS._ReadStrFile(_, confPath));
        return json;
    }
    /**
     * 保存项目文件
     * @param _ 
     * @param config 项目配置
     * @returns 
     */
    protected static async _SaveProjectConfig(_, config: JSON) {
        let projConf = new ProtocolObjectProjectConfig();
        projConf.fromMixed(config);
        let confPath = projConf.path + "/" + "front_forge_project.json";
        await IPCS._SaveStrFile(_, confPath, JSON.stringify(config));
        return true;
    }

    /**
     * 读取EDITOR配置
     * @param _ 
     * @returns 
     */
    protected static async _ReadEditorConfig(_) {
        let json = null;
        while (1) {
            try {
                json = JSON.parse(await IPCS._ReadStrFile(_, EDITOR_CONFIG_PATH));
                break;
            }
            catch (e) {
                //没有找到配置文件。
                await IPCS._SaveStrFile(_, EDITOR_CONFIG_PATH, JSON.stringify(IPCS.editorConfig.toMixed()));
            }
        }
        IPCS.editorConfig.fromMixed(json);
        return json;
    }
    /**
     * 保存EDITOR配置
     * @param _ 
     * @param json 
     * @returns 
     */
    protected static async _SaveEditorConfig(_, json: JSON) {
        IPCS.editorConfig.fromMixed(json);
        IPCS._refreshWindowState();
        return await IPCS._SaveStrFile(_, EDITOR_CONFIG_PATH, JSON.stringify(json))
    }
    /**
     * 读文本文件
     * @param _ 
     * @param path 
     * @returns 
     */
    protected static async _ReadStrFile(_, path: string) {
        if (!fs.existsSync(path)) {
            return "";
        }
        else {
            return fs.readFileSync(path).toString();
        }
    }
    /**
     * 保存文本文件
     * @param _ 
     * @param path 
     * @param dat 
     * @returns 
     */
    protected static async _SaveStrFile(_, path: string, dat: string) {
        fs.writeFileSync(path, dat);
        return true;
    }

    /**
     * 删除文件
     * @param _ 
     * @param path 
     * @returns 
     */
    protected static async _DeleteFile(_, path: string) {
        if (fs.existsSync(path)) {
            fs.rmSync(path);
            return true;
        }
        return false;
    }

    /**
     * 打开”打开文件夹“ 对话框
     * @param _ 
     * @returns 
     */
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