# todo: 
  - 做一个资源列表，自动加载。优化PrefabStr 膏药代码
  - persist 属性，开头加载。常驻。
  - BUG: 代码保存后点击资源界面，代码会被复原。
  - BUG: 预览的进程无法杀死，常驻在系统。
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

# helloworld
- 点击”+“，新建项目
- 填入项目名字，选择一个路径存放项目
- 点击新建，等待项目创建完毕。
- 点击”▶“，打开项目

- 打开项目后，进入的是主界面。（主界面文档请参考下面章节）
- 点击第二排的“+” 按钮，新建一个资源。
- 新建一个"page_home"资源，下面是组名"pages"，点击新建资源。然后就能看到page_home已经在资源列表中。
- 点击上面的“⌨“按钮打开代码编辑器。
- 点击"page_home"资源。
- 在代码编辑器中，选择”Dom“标签，此标签的编辑器可编辑css/html。
- 编辑代码，保存。（代码文档请参考下面章节）
- 点击主界面的”▶“，预览你的网站。