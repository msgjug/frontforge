import fs from 'fs'
import path from 'path'
import { DirentHandle } from "../classes/dirent_handle"
import { ProtocolObjectProjectConfig } from '../classes/protocol_dist';
import { IPCS } from './ipcs';
import Utils from './utils';

const TEMPLATE_MAIN_TS = Utils.GetResourcePath('template/template-main.ts');
export class ProjectUtils {

    static async BuildProject(projConf: ProtocolObjectProjectConfig) {
        let prefabConf = projConf.prefabs_list.find(ele => ele.name === projConf.entrance_prefab_name)!;
        if (!prefabConf) {
            IPCS.Log("错误，找不到入口。");
            return false;
        }

        //删除MAIN.TS 删除 RES_INDEX.TS
        const MAIN_PATH = path.join(projConf.path, "src/main.ts");
        const RES_INDEX_PATH = path.join(projConf.path, "/src/res_index.ts");
        await ProjectUtils.DeleteFile(MAIN_PATH);
        await ProjectUtils.DeleteFile(RES_INDEX_PATH);

        let prefabPath = "./prefabs/" + prefabConf.name;
        //覆盖MAIN.ts
        IPCS.Log(`生成Main文件：${MAIN_PATH}`);
        await IPCS.CopyFile(`"${TEMPLATE_MAIN_TS}"`, `"${MAIN_PATH}"`);
        await IPCS.FileContentReplaceKey(`${MAIN_PATH}`,
            ["{{PATH}}", prefabPath],
            ["{{CLASS_NAME_BIG}}", Utils.SnakeToPascal(prefabConf.name)]
        );
        IPCS.Log("生成Main文件，OK");

        //准备RES_INDEX
        IPCS.Log(`生成Res_Index文件：${RES_INDEX_PATH}`);
        let res_index_str = "";
        projConf.prefabs_list.forEach(conf => {
            let PascalName = Utils.SnakeToPascal(conf.name);
            res_index_str += `import ${PascalName} from "./prefabs/${conf.name}"\n`;
            res_index_str += `import ${PascalName}Prefab from "./prefabs/${conf.name}.prefab.html?raw"\n`;
            res_index_str += `${PascalName}["__BindPrefab__"] = ${PascalName}Prefab;\n`;
            res_index_str += `\n`;
        });
        ProjectUtils.WriteStrFile(RES_INDEX_PATH, res_index_str);

        IPCS.Log("生成Res_Index文件，OK");

        return true;
    }
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
            await ProjectUtils.ListDir(path + "/", dh);
        }
        else {
            dh.extName = path.substring(path.lastIndexOf(".") + 1);
            dh.dataStr = fs.readFileSync(path).toString();
        }

        return dh;
    }

    static async WriteStrFile(path: string, dat: string) {
        await fs.writeFileSync(path, dat);
        return true;
    }

    static async ReadStrFile(path: string) {
        if (!await fs.existsSync(path)) {
            return "";
        }
        else {
            return fs.readFileSync(path).toString();
        }
    }
    static async DeleteFile(path: string) {
        if (await fs.existsSync(path)) {
            await fs.rmSync(path);
            return true;
        }
        return false;
    }
};