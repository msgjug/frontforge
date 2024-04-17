import './css/global.css'

import Prefab from './core/prefab'
import WebApplication from './core/web_application'
import Utils from './core/utils'

//assets
import Scene from './core/scene'
var app = new WebApplication();
app.init();
//contain
let scene = Prefab.Instantiate(Scene);
app.root.addChild(scene);
Utils.scene = scene;

import {{CLASS_NAME_BIG}} from '{{PATH}}'
scene.replacePage(Prefab.Instantiate({{CLASS_NAME_BIG}}));

window["app"] = app;