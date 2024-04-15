import { dialog, ipcMain } from "electron/main";
import { AppUtils } from "./app_open";

export class IPCS {
    static Init() {
        ipcMain.handle("FF:OpenApp", this._OpenApp)
    }

    protected static async _OpenApp() {
        const { canceled, filePaths } = await dialog.showOpenDialog(null!, {
            properties: ['openFile', 'openDirectory']
        });
        if (!canceled) {
            return await AppUtils.OpenAppPath(filePaths[0])
        }

        return [];
    }
};  