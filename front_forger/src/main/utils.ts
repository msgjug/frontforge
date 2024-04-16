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
}