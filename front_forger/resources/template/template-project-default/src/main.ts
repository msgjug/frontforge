import './css/global.css'

import Prefab from './core/prefab'
import WebApplication from './core/web_application'
import Utils from './core/utils'

//assets
import Scene from './core/prefabs/scene'
import MsgHub from './core/subject'
var app = new WebApplication();
app.init();
MsgHub.emit("app-inited");
//contain
let scene = Prefab.Instantiate(Scene);
app.root.addChild(scene);
Utils.scene = scene;
MsgHub.emit("scene-inited");

window["app"] = app;