import MsgHub from "./core/subject";
import Utils from "./core/utils";

export default class __Preview__ {
    static Init() {
        MsgHub.on("scene-inited", this.onReady, this);
    }

    static onReady() {
        Utils.scene.subject.on("replace-page", this.onReplacePage, this);
    }

    static replaceCount = 0;
    static onReplacePage() {
        if (this.replaceCount === 0) {
            Utils.scene.curPage.dispose();
        }
        this.replaceCount++;
    }
};