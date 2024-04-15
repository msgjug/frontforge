import './css/global.css'

import Prefab from './core/prefab'
import WebApplication from './core/web_application'
import Utils from './core/utils'

//assets
import FrameHead from './frame/head/frame_head'
import Scene from './core/scene'


function doAThing(): void {
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
  

  //跳页
  head.jumpStamp(PageStamp);

  window["app"] = app;
}


function init(): void {
  window.addEventListener('DOMContentLoaded', () => {
    doAThing()
  })
}

init()
