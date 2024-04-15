import * as Tween from "@tweenjs/tween.js";
import { AppNode, property } from "../app_node";
import { RegClass } from "../serialize";
import PrefabStr from './toast.prefab.html?raw'
@RegClass("MsgBox")
export default class Toast extends AppNode {
    @property("div[name=text]")
    lbText: HTMLDivElement = null;
    get opacity() {
        return Number(this.ele.style.opacity);
    }
    set opacity(val) {
        this.ele.style.opacity = `${val}`;
    }
    onLoad() {
        super.onLoad();
    }

    async show(text: string, sec: number) {
        this.lbText.innerText = text;
        let t1 = new Tween.Tween(this)
            .to({ opacity: 1 }, 200)
        t1.chain(
            new Tween.Tween(this)
                .delay(sec * 1000) //动画延迟多久才开始执行。
                .to({ opacity: 0 }, 200)
                .onComplete(
                    () => {
                        this.dispose();
                    }
                )
        )
            .start();
    }
    static get PrefabStr(){
        return PrefabStr;
    }
};