import './css/global.css'

import Prefab from './core/prefab'
import WebApplication from './core/web_application'
import Utils from './core/utils'

//assets
import Scene from './core/scene'
import PageCreator from './prefabs/page_creator/page_creator'
import { AppNode } from './core/app_node'
import PageCode from './prefabs/page_code/page_code'
import EditorEnv from './env'
import BoxProject from './prefabs/box_project/box_project'
import Nav from './prefabs/title/nav'

const ROUTE: { [key: string]: new () => AppNode } = {
  "index": PageCreator,
  "code": PageCode,

  "BoxProject": BoxProject,
};

(() => {
  window.addEventListener('DOMContentLoaded', () => {
    var app = new WebApplication();
    app.init();
    //contain
    let scene = Prefab.Instantiate(Scene);
    app.root.addChild(scene);
    Utils.scene = scene;

    scene.addChild(Prefab.Instantiate(Nav));

    const PageStamp = Utils.parseUrlParam(false).ps || "none";
    const BoxStamp = Utils.parseUrlParam(false).box || "none";
    if (PageStamp !== "none") {
      scene.replacePage(Prefab.Instantiate(ROUTE[PageStamp]));
    }
    if (BoxStamp !== "none") {
      scene.addChild(Prefab.Instantiate(ROUTE[BoxStamp]));
      scene.replacePage(Prefab.Instantiate(ROUTE[PageStamp]));
    }

    window.electron.ipcRenderer.on("FF:Broadcast", EditorEnv.onIPCMessage.bind(EditorEnv));

    window["app"] = app;
  })
})();
