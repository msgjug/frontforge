import { AppNode, property } from "../../core/app_node";
import Prefab from "../../core/prefab";
import { RegClass } from "../../core/serialize";
import Utils from "../../core/utils";
import PrefabStr from './frame_head.prefab.html?raw'

import MsgHub from "../../core/subject";
import PageCreator from "../../pages/page_creator/page_creator";

const ROUTE: { [key: string]: new () => AppNode } = {
    "index": PageCreator,
    "creator": PageCreator
};

@RegClass("FrameHead")
export default class FrameHead extends AppNode {
    stamp: string = "";

    onLoad(): void {
        super.onLoad();
    }
    onDispose(): void {
    }
    onClickStamp(btn: HTMLElement) {
        this.jumpStamp(btn.getAttribute("stamp") || "index");
        this.refresh();
    }
    jumpStamp(stamp: string) {
        if (stamp) {
            if (this.stamp === stamp) {
                return;
            }
            this.stamp = stamp;
        }
        Utils.scene.replacePage(Prefab.Instantiate(ROUTE[stamp]));
    }
    onClickTitle() {
        Utils.app.msgBox("FrontForge弹窗");
    }
    onClickToggleFilter() {
        MsgHub.emit("toggle-filter");
    }

    refresh() {
    }
    static get PrefabStr() {
        return PrefabStr;
    }
};