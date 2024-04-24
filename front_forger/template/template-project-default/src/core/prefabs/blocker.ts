import { AppNode, property } from "../app_node";
import { RegClass } from "../serialize";
import PrefabStr from "./blocker.prefab.html?raw"

@RegClass("Blocker")
export default class Blocker extends AppNode {
    protected _ref = 0;

    get ref() {
        return this._ref;
    }
    set ref(val) {
        this._ref = val;
        this.active = this._ref > 0;
    }

    @property("label[name=desc]")
    lbDesc: HTMLLabelElement = null;

    onLoad(): void {
        super.onLoad();
        this.active = false;
        this.ele.onclick = this.onClickBlockInput.bind(this);
    }
    onClickBlockInput(event) {
        event.stopPropagation();
    }
    static get PrefabStr(){
        return PrefabStr;
    }
};