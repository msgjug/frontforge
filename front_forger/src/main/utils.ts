import { app, dialog } from "electron";
import path from "path";
import fs from 'fs'

export default class Utils {
    static SnakeToPascal(str: string) {
        // 将字符串分割成数组，使用下划线作为分隔符
        var parts = str.split('_');
        // 将所有元素的首字母大写
        for (var i = 0; i < parts.length; i++) {
            parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
        }
        // 将数组合并成一个字符串
        return parts.join('');
    }

    static GetResourcePath(resourceName) {
        // // 检查是否为生产模式（asar打包）
        if (app.isPackaged) {
            // 生产模式下，使用 app.asar.unpacked 路径
            return path.join(process.cwd(), "resources", "app", "resources", resourceName);
        } else {
            // 开发模式下，直接使用项目目录
            return path.join(process.cwd(), "resources", resourceName);
        }
    }

    static GetPackageJsonPath() {
        // // 检查是否为生产模式（asar打包）
        if (app.isPackaged) {
            // 生产模式下，使用 app.asar.unpacked 路径
            return path.join(process.cwd(), "resources", "app", "package.json");
        } else {
            // 开发模式下，直接使用项目目录
            return path.join(process.cwd(), "package.json");
        }
    }

    //复制文件夹
    static async CopyDirectory(src: string, dest: string) {
        // 创建目标文件夹
        fs.mkdirSync(dest, { recursive: true });
        // 读取源文件夹
        let files = fs.readdirSync(src);
        files.forEach(async file => {
            const srcPath = path.join(src, file);
            const destPath = path.join(dest, file);
            let stats = fs.statSync(srcPath);
            if (stats.isDirectory()) {
                // 如果是文件夹，递归复制
                await Utils.CopyDirectory(srcPath, destPath);
            } else {
                // 如果是文件，复制文件
                fs.copyFileSync(srcPath, destPath);
            }
        });
    }

    // 同步递归删除文件夹，但保留特定的文件或子文件夹
    static DeleteDirectoryExceptSync(directoryPath: string, exceptions: string[] = [], rmDir = false) {
        try {
            // 读取文件夹内容
            const files = fs.readdirSync(directoryPath);

            // 遍历文件夹内容
            files.forEach(file => {
                const filePath = path.join(directoryPath, file);
                const stats = fs.statSync(filePath);

                // 检查是否为应保留的项
                if (exceptions.includes(file)) {
                    // 如果是文件夹，递归检查
                    // if (stats.isDirectory()) {
                    //     Utils.DeleteDirectoryExceptSync(filePath, exceptions,true);
                    // }
                } else {
                    // 删除文件或子文件夹
                    if (stats.isDirectory()) {
                        fs.rmSync(filePath, { recursive: true });
                    } else {
                        fs.unlinkSync(filePath);
                    }
                }
            });

            if(rmDir){
                // 最后删除空文件夹
                fs.rmSync(directoryPath);
            }
            console.log(`Directory ${directoryPath} deleted successfully, except for specified exceptions.`);
        } catch (err) {
            console.error(`Error deleting directory ${directoryPath}:`, err);
        }
    }
}