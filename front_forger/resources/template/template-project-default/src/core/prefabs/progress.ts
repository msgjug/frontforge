import { AppNode } from "../core/app_node";
import { RegClass } from "../core/serialize";
@RegClass("Progress")
export default class Progress extends AppNode {
    _progress = 0;
    bar: HTMLDivElement=null;
    get progress() {
        return this._progress;
    }
    set progress(val) {
        this._progress = val;
        this.updateProgress();
    }
    // 更新进度条
    updateProgress() {
        this.bar.style.width = this.progress + '%';
        this.bar.textContent = this.progress.toFixed(0) + '%';
    }
};