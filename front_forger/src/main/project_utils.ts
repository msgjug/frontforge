import fs from 'fs'
import { DirentHandle } from "../classes/dirent_handle"

export class ProjectUtils {
    static GetNameByPath(path: string) {
        let i1 = path.lastIndexOf("/");
        let i2 = path.lastIndexOf("\\");
        if (i1 === -1 && i2 === -1) {
            console.warn("__GetNameByPath, warn:", path);
            return path;
        }
        if (i1 > i2) {
            return path.substring(i1 + 1);
        }
        else {
            return path.substring(i2 + 1);
        }
    }
    static async ListDir(path: string, parentDH: DirentHandle) {
        const fsDir = fs.opendirSync(path);
        let dirent = fsDir.readSync()!;
        while (dirent) {
            if (dirent.name !== "node_modules") {
                let dh: DirentHandle = (await ProjectUtils.GetDirentHandle(path + dirent.name, dirent.name))!;
                parentDH.children.push(dh);
            }
            dirent = fsDir.readSync()!;
        }
        fsDir.closeSync();
    }
    static async GetDirentHandle(path: string, name: string = "") {
        if (!fs.existsSync(path)) {
            return null;
        }
        const stat = fs.statSync(path);
        let dh = new DirentHandle();
        dh.name = name || ProjectUtils.GetNameByPath(path);
        dh.path = path;
        dh.isDir = !stat.isFile();
        if (dh.isDir) {
            console.log("dir:", path + "/");
            await ProjectUtils.ListDir(path + "/", dh);
        }
        else {
            dh.extName = path.substring(path.lastIndexOf(".") + 1);
            dh.dataStr = fs.readFileSync(path).toString();
            console.log("file:", dh.path);
        }

        return dh;
    }
    //检查项目完整性
    static async CheckProject(path: string) {
        // let dh = new DirentHandle();
        // dh.isDir = true;
        // dh.path = path;
        // dh.name = path.substring(path.lastIndexOf("/") + 1);
        // await ProjectUtils.ListDir(path + "/", dh);
        // return dh;
    }
};