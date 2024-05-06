
# 构建
 - npm run build:win
 - 等待ELECTRON下载，安装等。如果太慢，可以修改.npmrc 
 - 如果报“ERROR: Cannot create symbolic link ” 这种错误，表示命令行的权限不够，用管理员执行一次npm run build:win ，然后以后就正常构建。
 - 文件在dist
# 调试运行预览
 - 可以用VSCODE 打开 front_forger，按F5（ 主进程可以断点调试）
 - 进入front_forger 文件夹，执行 npx electron-vite 
# electron 镜像源
- https://registry.npmmirror.com/-/binary/electron/


# 对FF框架进行了升级
- APPNODE 绑定 app_node.ts prefab.ts
- scene.ts web_app
- serialize.ts
- utils.ts
- cache_Data.ts

# done:
  - 优化：替代膏药代码，与PrefabStr说再见 
  - 修BUG: 代码保存后点击资源界面，代码会被复原。
  - 修BUG: 预览的进程无法杀死，常驻在系统。
  - 修BUG：窗口的setPosition 会改变窗口大小（在系统UI为100% 以上时触发这个BUG）
  - persist 属性，开头加载。常驻。

# todo: 
  - 修BUG：不缓存TS STR 和 DOM STR，每次访问都从文件读取。
  - 设计器，编辑CSS，MAIN。