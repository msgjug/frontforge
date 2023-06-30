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
import PageFF from "../../pages/page_ff/page_ff";

const ROUTE: Col<new () => AppNode> = {
    "index": PageFF,
};

@RegClass("FrameHead")
export default class FrameHead extends AppNode {
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
        Utils.scene.replacePage(Prefab.Instantiate(ROUTE[stamp]), stamp);
    }
    onClickTitle() {
        Utils.app.msgBox("FrontForge弹窗");
    }
    onClickToggleFilter() {
        MsgHub.emit("toggle-filter");
    }

    refresh() {
    }
};

FrameHead["PrefabStr"] = PrefabStr;