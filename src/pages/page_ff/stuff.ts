import { AppNode, property, propertys } from "../../core/app_node";
import { RegClass } from "../../core/serialize";
import PrefabStr from "./stuff.prefab.html?raw"

var STUFF_ID = 0;
@RegClass("PageFF")
export default class Stuff extends AppNode {
    @property("button[name=x]", { onclick: "onClickDel" })
    btnX: HTMLButtonElement = null;

    @property("label")
    lb: HTMLLabelElement = null;

    onLoad(): void {
        this.lb.innerText = `${STUFF_ID++}`;
    }

    onClickDel() {
        this.dispose();
    }
};

Stuff["PrefabStr"] = PrefabStr;