import './css/global.css'

import Prefab from './core/prefab'
import WebApplication from './core/web_application'
import Utils from './core/utils'

//assets
import FrameHead from './frame/head/frame_head'
import Scene from './core/scene'
import FrameFoot from './frame/foot/frame_foot'
import data from './core/cache_data'
import Macro from './core/macro'

const PageStamp = Utils.parseUrlParam(false).ps || "index";

var app = new WebApplication();
app.init();
//head
let head = Prefab.Instantiate(FrameHead);
app.root.addChild(head);
//contain
let scene = Prefab.Instantiate(Scene);
app.root.addChild(scene);
Utils.scene = scene;
//foot
app.root.addChild(Prefab.Instantiate(FrameFoot));

//跳页
head.jumpStamp(PageStamp);

//welcome弹窗
if (data.welcomeTime < parseInt(Macro.APP_VERSION_TIMESTAMP)) {
  data.welcomeTime = parseInt(Macro.APP_VERSION_TIMESTAMP);
  data.save();
  //   app.root.addChild(Prefab.Instantiate(BoxWelcome));
}

window["app"] = app;