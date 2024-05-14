import * as Tween from "@tweenjs/tween.js";

import { Subject } from "./subject";
import Utils, { rAF, Sync } from "./utils";
import Prefab from "./prefab";
import MsgBox from "./prefabs/msg_box";
import AppNode from "./app_node";
import { RegClass } from "./serialize";
import data from "./cache_data";
import MsgBoxYesNo from "./prefabs/msg_box_yes_no";
import TabView from "./prefabs/tab_view";
import TabViewVerticle from "./prefabs/tab_view_verticle";
import Blocker from "./prefabs/blocker";
import Silder from "./prefabs/slider";

//控件
TabView
TabViewVerticle
Silder

@RegClass("WebApplication")
export default class WebApplication extends Subject {
    // body: HTMLElement = null;
    root: AppNode = null;
    blocker: Blocker = null;
    init() {
        Utils.app = this;

        data.load();

        this.root = new AppNode();
        this.root.init(document.body, null);
        rAF.set(this.loop);

        this.blocker = Prefab.Instantiate(Blocker);
        this.root.addChild(this.blocker);
    }
    frameTime = Date.now();
    frameDeltaTime = 0;
    loop() {
        let nowFrame = Date.now();
        this.frameDeltaTime = nowFrame - this.frameTime;
        this.frameTime = nowFrame;
        Tween.update();
    }
    showBlock(desc: string) {
        this.blocker.ref++;
        this.blocker.lbDesc.innerText = desc;
    }
    hideBlock() {
        this.blocker.ref--;
    }
    msgBox(text: string, title?: string) {
        title = title || "消息";
        let node = Prefab.Instantiate(MsgBox);
        this.root.addChild(node);

        node.text = text;
        node.title = title;


        return node;
    }
    msgBoxYesNo(text: string, title?: string) {
        title = title || "消息";
        let node = Prefab.Instantiate(MsgBoxYesNo);
        this.root.addChild(node);
        node.text = text;
        node.title = title;
        return node;
    }
    msgBoxSync(text: string, title?: string) {
        let box = this.msgBox(text, title);
        return Sync.SubjectMessage<void>("ok", box.subject);
    }
    msgBoxYesNoSync(text: string, title?: string) {
        return new Promise<boolean>(ok => {
            let box = this.msgBoxYesNo(text, title);
            box.subject.on("yes", () => { ok(true) }, this);
            box.subject.on("no", () => { ok(false) }, this);
        });
    }
};