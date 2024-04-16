import fs from 'fs'
import { DirentHandle } from "../classes/dirent_handle"

export class ProjectUtils {
    static async ListDir(path: string, parentDH: DirentHandle) {
        const fsDir = fs.opendirSync(path);
        let dirent = fsDir.readSync()!;
        while (dirent) {
            if (dirent.name !== "node_modules") {
                let dh = new DirentHandle();
                dh.name = dirent.name;
                dh.path = path + dirent.name;
                dh.isDir = dirent.isDirectory();
                parentDH.children.push(dh);
                if (dh.isDir) {
                    console.log("dir:", path + dirent.name + "/");
                    await ProjectUtils.ListDir(path + dirent.name + "/", dh);
                }
                else {
                    dh.extName = dirent.name.substring(dirent.name.lastIndexOf(".") + 1);
                    dh.buffer = fs.readFileSync(path + dirent.name)
                    console.log("file:", dh.path);
                }
            }
            dirent = fsDir.readSync()!;
        }
        fsDir.closeSync();
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