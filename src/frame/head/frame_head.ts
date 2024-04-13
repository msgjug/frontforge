import { AppNode, property, propertys } from "../../core/app_node";
import Prefab from "../../core/prefab";
import { RegClass } from "../../core/serialize";
import Utils from "../../core/utils";
import { Col } from "../../core/data_ext";
import PrefabStr from './frame_head.prefab.html?raw'

// import IconList from "../../assets/list.svg"
// import IconTimeLine from "../../assets/time.svg"
// import IconFilter from "../../assets/filter.svg"

import MsgHub from "../../core/subject";
import PageIndex from "../../pages/page_index/page_index";
import PageCreator from "../../pages/page_creator/page_creator";

const ROUTE: Col<new () => AppNode> = {
    "index": PageIndex,
    "creator": PageCreator
};

@RegClass("FrameHead")
export default class FrameHead extends AppNode {
    stamp: string = "";
    @property("b[name=site_name]", { onclick: "onClickTitle" })
    lbSiteName: HTMLElement = null;

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