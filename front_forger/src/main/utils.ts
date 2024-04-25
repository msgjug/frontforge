import { app, dialog } from "electron";
import path from "path";

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

    //     // 使用方法
    //     const resourcePath = getResourcePath('path/to/your/resource');

    // console.log(`Resource path: ${resourcePath} `);

}