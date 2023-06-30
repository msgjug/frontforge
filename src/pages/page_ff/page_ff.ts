import { AppNode, property, propertys } from "../../core/app_node";
import Prefab from "../../core/prefab";
import { RegClass } from "../../core/serialize";
import Utils from "../../core/utils";
import PrefabStr from "./page_ff.prefab.html?raw"
import Stuff from "./stuff";
@RegClass("PageFF")
export default class PageFF extends AppNode {
    //button按钮
    @property("button[name=toast]", { onclick: "onClickToast" })
    btnToast: HTMLButtonElement = null;
    @property("button[name=msgbox]", { onclick: "onClickMsgbox" })
    btnMsgBox: HTMLButtonElement = null;
    toastInd = 0;
    msgBoxInd = 0;
    onClickToast() {
        Utils.scene.toast(`这是一个Toast${this.toastInd++}`);
    }
    onClickMsgbox() {
        Utils.app.msgBox(`这是一个弹窗消息${this.msgBoxInd++}`);
    }

    //Slider拖动
    @property("input[name=count]", { onchange: "onCountChanged" })
    sliCount: HTMLInputElement = null;
    @property("span[name=count]")
    lbCount: HTMLSpanElement = null;
    onCountChanged() {
        this.lbCount.innerText = this.sliCount.value;
    }

    //Select选项
    @property("select[name=type]", { onchange: "onTypeChanged" })
    selType: HTMLInputElement = null;
    @property("span[name=type]")
    lbType: HTMLSpanElement = null;
    onTypeChanged() {
        this.lbType.innerText = this.selType.value;
    }

    //radio单选
    @propertys("input[name=single]", { onclick: "onClickRadio" })
    singleRadios: HTMLInputElement[] = [];
    @property("span[name=single]")
    lbSingle: HTMLSpanElement = null;
    onClickRadio(radio: HTMLInputElement, evt: PointerEvent) {
        this.lbSingle.innerText = radio.value;
    }

    //radio多选
    @propertys("input[name=muti]", { onclick: "onClickMutiCheckBox" })
    mutiCheckBoxes: HTMLInputElement[] = [];
    @property("span[name=muti]")
    lbMuti: HTMLSpanElement = null;
    onClickMutiCheckBox(radio: HTMLInputElement, evt: PointerEvent) {
        let arr: string[] = [];
        this.mutiCheckBoxes.forEach(box => {
            if (box.checked) {
                arr.push(box.value);
            }
        })
        this.lbMuti.innerText = arr.join(",");
    }

    //Editbox输入框
    @property("input[name=eb]", { onchange: "onEbChanged" })
    eb: HTMLInputElement = null;
    @property("span[name=eb]")
    lbEb: HTMLSpanElement = null;
    onEbChanged() {
        this.lbEb.innerText = this.eb.value;
    }


    //元素/容器
    @property("div[name=stuff_contain]")
    stuffContain: HTMLDivElement = null;
    @property("button[name=stuff_add]", { onclick: "onClickAddStuff" })
    btnAddStuff: HTMLButtonElement = null;
    onClickAddStuff() {
        let stuff = Prefab.Instantiate(Stuff);
        this.addChild(stuff, this.stuffContain);
    }
};

PageFF["PrefabStr"] = PrefabStr;