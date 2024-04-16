import { AppNode } from "../../../core/app_node";
import { RegClass } from "../../../core/serialize";
@RegClass("Selector")
export class Selector extends AppNode {
    opts: HTMLOptionElement[] = [];
    setData(tags: string[], values: string[] = null) {
        if (!values) {
            values = tags;
        }
        for (let i = 0; i < tags.length; i++) {
            let opt = document.createElement("option");
            opt.value = values[i];
            opt.innerText = tags[i];
            this.ele.appendChild(opt);
            this.opts.push(opt);
        }
    }
    select(val: string) {
        // let foundInd = this.opts.findIndex(ele => ele.value == val);
        // if (foundInd === -1) {
        //     return;
        // }
        //@ts-ignore
        this.ele.value = val;
    }
    static get PrefabStr() {
        return "<dom><div></div></dom>";
    }
};