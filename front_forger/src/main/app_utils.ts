import fs from 'fs'

export class FileHandle {
    path = "";
    name = "";
    dirent: fs.Dirent = null!;
    buffer: Buffer = null!;
}

export class AppUtils {
    private static async __rec(path: string, extName: string = "", res: FileHandle[] = []) {
        const fsDir = fs.opendirSync(path);
        let dirent = fsDir.readSync()!;
        while (dirent) {
            if (dirent.name !== "node_modules") {
                if (dirent.isDirectory() ) {
                    console.log("dir:", path + dirent.name + "/");
                    await this.__rec(path + dirent.name + "/", extName, res);
                }
                else {
                    if (!extName || dirent.name.split(".")[1] == extName) {
                        let fh = new FileHandle();
                        fh.path = path + dirent.name;
                        fh.name = dirent.name;
                        fh.buffer = fs.readFileSync(path + dirent.name)
                        fh.dirent = dirent;
                        console.log("file:", fh.path);
                        res.push(fh);
                    }
                }
            }
            dirent = fsDir.readSync()!;
        }
        fsDir.closeSync();
    }
    static async OpenAppPath(path: string) {
        let fhs: FileHandle[] = [];
        await this.__rec(path + "/", "ts", fhs);
        return fhs;
    }
};