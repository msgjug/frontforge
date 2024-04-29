import { dialog, ipcMain } from "electron/main";
import fs from 'fs';
import { ProtocolObjectIPCResponse, ProtocolObjectLog, ProtocolObjectPrefabConfig, ProtocolObjectProjectConfig, ProtocolObjectWindowChange } from "../classes/protocol_dist";
import { exec, execSync } from "child_process";
import ActionExec from "./action_exec";
import { ProjectUtils } from "./project_utils";
import { DirentHandle } from "../classes/dirent_handle";
import Utils from "./utils";
import { app, BrowserWindow, Menu, MenuItem, screen, shell } from "electron";
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

    static screenScaleFactor = 1; //系统的屏幕缩放因子，一般是100%
    static async Init() {
        let pScreen = screen.getPrimaryDisplay();
        IPCS.screenScaleFactor = pScreen.scaleFactor;
        //读取EDITOR配置
        await IPCS._ReadEditorConfig(null);
        //创建MAIN窗口，并居中，加入快捷键
        IPCS.mainWindow = IPCS._createWindow("main", 0, 0, IPCS.editorConfig.win_main_w, IPCS.editorConfig.win_main_h, "index");
        IPCS.mainWindow.center();
        IPCS.InitHotKey(IPCS.mainWindow);
        //CODE窗口跟随MAIN
        IPCS.mainWindow.on("move", () => {
            //缩放因子不为1时，不跟踪，因为ELECTRON 有BUG。
            if (IPCS.screenScaleFactor !== 1) {
                return;
            }
            if (IPCS.codeWindow && IPCS.codeWindow.isVisible()) {
                let srcSize = IPCS.codeWindow.getSize();
                let pos = IPCS.mainWindow.getPosition();

                IPCS.codeWindow.setBounds({
                    x: pos[0] + IPCS.editorConfig.win_main_w,
                    y: pos[1],
                    width: srcSize[0],
                    height: srcSize[1]
                });
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

        let tag = process.argv[1];
        switch (tag) {
            case "log":
                IPCS._createWindow("box_logger", 0, 0, IPCS.editorConfig.win_main_w, IPCS.editorConfig.win_main_h, "", "BoxLogger", "", "", true);
                break;
        }
    }
    static Log(str: string) {
        let msg = new ProtocolObjectLog();
        msg.str = str;
        let wcs: Electron.WebContents[] = [];
        IPCS.windows.forEach(wh => {
            wcs.push(wh.win.webContents);
        });
        IPCS.Broadcast(wcs, msg.toMixed());
    }

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
    // 退出程序
    protected static _Quit(_) {
        if (IPCS.__ae) {
            IPCS.__ae.kill();
            IPCS.killChildVite();
            IPCS.__runProjectPort = "";
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
        IPCS.Log("--- 检查项目");
        let rtn = new ProtocolObjectIPCResponse();
        //检查是否有front_forge_project.json
        let confPath = path + "/" + "front_forge_project.json";
        IPCS.Log(`项目配置文件路径：${confPath}`);
        rtn.ret = fs.existsSync(confPath) ? 0 : 1;
        IPCS.Log(rtn.ret === 1 ? "找不到配置" : "已找到配置")
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
     * @param resizable 
     * @returns 
     */
    protected static _CreateWindow(_, name: string, x: number, y: number, width: number, height: number, page: string, box: string, modal = "", child = "", resizable = false) {
        if (IPCS.windows.find(ele => ele.name === name)) {
            return;
        }
        const win = IPCS._createWindow(name, x, y, width, height, page, box, modal, child, resizable);
        win.once("ready-to-show", () => win.show());
    }
    /** 执行命令行对象 */
    private static __ae: ActionExec = null!;
    private static __runProjectPort = "";
    /**
     * 运行项目， (npx vite)
     * @param _ 
     * @param projDat 项目配置
     * @returns 
     */
    protected static async _RunProject(_, projDat: JSON) {
        let projConf = new ProtocolObjectProjectConfig();
        projConf.fromMixed(projDat);
        if (!ProjectUtils.BuildProject(projConf)) {
            return null;
        }
        let port = (3000 + Math.random() * 9999).toFixed(0);
        IPCS.__runProjectPort = port;
        IPCS.Log(`执行命令：npx vite--port ${port}`);
        IPCS.__ae = new ActionExec(projConf.path);
        IPCS.__ae.cmd("npx.cmd", ["vite", "--port", port]);
        IPCS.__ae.onData = (str: string, delta: string) => {
            IPCS.Log(delta);
        };
        return port;
    }
    /**
     * 停止运行的项目
     * @param _ 
     */
    protected static async _StopProject(_) {
        IPCS.Log("--- 停止预览");
        if (IPCS.__ae) {
            IPCS.__ae.kill();
            IPCS.killChildVite();
            IPCS.__runProjectPort = "";
            IPCS.__ae = null!;
            IPCS.Log("成功");
        }
    }
    static killChildVite() {

        // 构建查找窗口标题的命令
        const findProcessCommand = `TASKLIST /FI "WINDOWTITLE eq npm exec vite --port ${IPCS.__runProjectPort}"`;

        // 执行命令获取进程信息
        exec(findProcessCommand, (err, stdout, stderr) => {
            if (err) {
                console.error(`错误: ${err.message}`);
                return;
            }
            if (stderr) {
                console.error(`标准错误输出: ${stderr}`);
                return;
            }

            // 解析进程信息
            const lines = stdout.trim().split('\n');
            lines.forEach((line) => {
                const parts = line.trim().split(/\s+/);
                if (parts.length >= 2) {
                    const pid = parts[1];
                    if (isNaN(Number(pid))) {
                        return;
                    }
                    console.log(`找到进程 PID: ${pid}`);

                    // 构建杀死进程的命令
                    const killProcessCommand = `taskkill /PID ${pid}`;
                    // 执行命令杀死进程
                    exec(killProcessCommand, (err, stdout, stderr) => {
                        if (err) {
                            console.error(`杀死进程时出错: ${err.message}`);
                            return;
                        }
                        if (stderr) {
                            console.error(`标准错误输出: ${stderr}`);
                            return;
                        }
                        console.log(`进程已成功杀死`);
                    });
                }
            });
        });
    }

    /**
     * 构建项目 (npx vite build)
     * @param _ 
     * @param projDat 项目配置
     * @returns 
     */
    protected static async _BuildProject(_, projDat: JSON) {
        IPCS.Log("--- 构建项目");
        let projConf = new ProtocolObjectProjectConfig();
        projConf.fromMixed(projDat);

        if (!ProjectUtils.BuildProject(projConf)) {
            return null;
        }

        IPCS.Log(`执行命令：npx vite build`);
        IPCS.__ae = new ActionExec(projConf.path);
        IPCS.__ae.cmd("npx.cmd", ["vite", "build"]);
        IPCS.__ae.onData = (str: string, delta: string) => {
            IPCS.Log(delta);
        };
        return new Promise(ok => IPCS.__ae.onEnd = ok);
    }
    /** 复制文件/文件夹 */
    static async CopyFile(p1, p2) {
        let copyStatment = `echo f| xcopy /y /c /s /h /r ` + `${p1} ${p2}`.replaceAll("./", "").replaceAll("/", "\\");
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
    static async FileContentReplaceKey(path: string, ...pairs: [string, string][]) {
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
        IPCS.Log("--- 新建Prefab");
        let projConf = new ProtocolObjectProjectConfig();
        projConf.fromMixed(projDat);
        // 新建文件
        const TEMPLATE_DIR = Utils.GetResourcePath("template/template-prefab/");
        const DST_DIR = projConf.path + `src\\prefabs\\`;

        let rtn = new ProtocolObjectIPCResponse();
        try {
            IPCS.Log(`复制TS模板"${TEMPLATE_DIR}_.ts" -> "${DST_DIR}${name}.ts"`);
            await IPCS.CopyFile(`"${TEMPLATE_DIR}_.ts"`, `"${DST_DIR}${name}.ts"`);
            IPCS.Log(`复制HTML模板"${TEMPLATE_DIR}_.prefab.html" -> "${DST_DIR}${name}.prefab.html"`);
            await IPCS.CopyFile(`"${TEMPLATE_DIR}_.prefab.html"`, `"${DST_DIR}${name}.prefab.html"`);
            IPCS.Log(`修改TS文件`);
            await IPCS.FileContentReplaceKey(`${DST_DIR}${name}.ts`, ["{{CLASS_NAME}}", name], ["{{CLASS_NAME_BIG}}", Utils.SnakeToPascal(name)]);
            IPCS.Log(`成功`);
        }
        catch (e) {
            rtn.ret = 1;
            rtn.msg = "新建文件失败";
            IPCS.Log(`错误：${e}`);
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
        IPCS.Log("--- 载入项目");
        let projConf = new ProtocolObjectProjectConfig();
        let confPath = path + "/" + "front_forge_project.json";
        IPCS.Log(`配置文件路径：${confPath}`);
        if (!fs.existsSync(confPath)) {
            IPCS.Log(`错误：找不到配置文件。`);
            return null;
        }
        else {
            projConf.fromMixed(JSON.parse(fs.readFileSync(confPath).toString()));
            IPCS.Log(`成功`);
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
        IPCS.Log("--- 新建项目");
        let rsp = new ProtocolObjectIPCResponse();
        let projConf = new ProtocolObjectProjectConfig();
        projConf.fromMixed(projDat);

        //默认给一个page_home资源，组名pages，并设置入口
        let prefab = new ProtocolObjectPrefabConfig();
        prefab.group = "pages";
        prefab.name = "page_home";
        projConf.prefabs_list.push(prefab);
        projConf.entrance_prefab_name = "page_home";

        if (fs.existsSync(projConf.path)) {
            rsp.ret = 1;
            rsp.msg = "文件夹已存在";
            IPCS.Log("失败： 文件夹已存在。");
        }
        else {
            fs.mkdirSync(projConf.path);
            IPCS.Log("创建文件夹，OK");
            const TEMPLATE_DIR = Utils.GetResourcePath("template/template-project-default/");
            const NODE_MODULES_PACK = Utils.GetResourcePath("template/node_modules_pack.zip");
            const PROJ_DIR = projConf.path;
            await IPCS.CopyFile(`"${TEMPLATE_DIR}*.*"`, `"${PROJ_DIR}\\"`);
            IPCS.Log("复制项目文件，OK");
            await fs.writeFileSync(`${PROJ_DIR}/front_forge_project.json`, JSON.stringify(projConf.toField()));
            IPCS.Log("创建项目配置文件，OK");
            await IPCS.FileContentReplaceKey(`${PROJ_DIR}/src/core/macro.ts`, ["{{APP_NAME}}", projConf.app_name]);
            IPCS.Log("创建项目常量文件，OK");
            //解压本地的node_modules_pack.zip包
            await compressing.zip.uncompress(NODE_MODULES_PACK, PROJ_DIR);
            IPCS.Log("解压node_modules，OK");
            // npm install 
            // let ae = new ActionExec(`${PROJ_DIR}`);
            // await ae.cmd("npm.cmd", ["install"]);
            IPCS.Log(`成功`);
        }
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
        return await ProjectUtils.ReadStrFile(path);
    }
    /**
     * 保存文本文件
     * @param _ 
     * @param path 
     * @param dat 
     * @returns 
     */
    protected static async _SaveStrFile(_, path: string, dat: string) {
        return await ProjectUtils.WriteStrFile(path, dat);
    }

    /**
     * 删除文件
     * @param _ 
     * @param path 
     * @returns 
     */
    protected static async _DeleteFile(_, path: string) {
        return await ProjectUtils.DeleteFile(path);
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