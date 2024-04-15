import * as Tween from "@tweenjs/tween.js";

import { Subject } from "./subject";
import Utils, { rAF } from "./utils";
import Prefab from "./prefab";
import MsgBox from "./prefabs/msg_box";
import { AppNode } from "./app_node";
import { RegClass } from "./serialize";
import data from "./cache_data";
import MsgBoxYesNo from "./prefabs/msg_box_yes_no";
import Blocker from "./prefabs/blocker";


@RegClass("WebApplication")
export default class WebApplication extends Subject {
    // body: HTMLElement = null;
    root: AppNode = null;
    blocker: Blocker = null;
    init() {
        Utils.app = this;

        data.load();

        this.root = new AppNode();
        this.root.init(document.body);
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
    }
    msgBoxYesNo(text: string, title?: string) {
        return new Promise<boolean>(ok => {
            title = title || "消息";
            let node = Prefab.Instantiate(MsgBoxYesNo);
            this.root.addChild(node);
            node.text = text;
            node.title = title;

            node.subject.on("yes", () => { ok(true) }, this);
            node.subject.on("no", () => { ok(false) }, this);
        });
    }

    scrollBottom() {
        let scrollOptions: ScrollToOptions = {
            left: 0,
            top: 999999999999999999,
            behavior: 'smooth'
        };
        window.scrollTo(scrollOptions);
    }

    scrollTop() {
        let scrollOptions: ScrollToOptions = {
            left: 0,
            top: 0,
            behavior: 'smooth'
        };
        window.scrollTo(scrollOptions);
    }
};