import { AppNode } from "../../../core/app_node";
import { RegClass } from "../../../core/serialize";
import PrefabStr from "./box_help.prefab.html?raw"

import Doc1 from "./1.txt?raw";
import Doc2 from "./2.txt?raw";
import Doc3 from "./3.txt?raw";
import DocTS from "./ts.txt?raw";
import DocDom from "./dom.txt?raw";
import DocAbout from "./about.txt?raw";

@RegClass("BoxHelp")
export default class BoxHelp extends AppNode {
    docTitles: HTMLDivElement[] = [];
    main: HTMLDivElement = null;
    onClickDoc(id) {
        this.showDoc(id);
    }
    onLoad(): void {
        this.showDoc(1);
    }
    showDoc(id) {
        this.docTitles.forEach((ele, ind) => {
            if (ind + 1 == id) {
                ele.setAttribute("cur", "");
            }
            else {
                ele.removeAttribute("cur");
            }
        })

        let docStr = "";
        switch (id) {
            case 1:
                docStr = Doc1;
                break;
            case 2:
                docStr = Doc2;
                break;
            case 3:
                docStr = Doc3;
                break;
            case 4:
                docStr = DocDom;
                break;
            case 5:
                docStr = DocTS;
                break;
            case 6:
                docStr = DocAbout;
                break;
        }
        this.main.innerHTML = "";

        let lines = docStr.replace("\r", "").trim().split("\n");
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let imgUrl = BoxHelp.__ParseImgUrl(line);
            let ele: HTMLElement = null;
            if (imgUrl) {
                let img = document.createElement("img");
                img.src = imgUrl;
                // img.className = "doc-img";
                img.onclick = this.onClickImg.bind(this);
                ele = img;
            }
            else {
                let p = document.createElement("p");
                p.innerText = line;
                // p.className = "doc-p";
                ele = p;
            }

            if (ele) {
                this.main.appendChild(ele);
            }
        }
    }

    private static __ParseImgUrl(lineStr: string) {
        const regex = /{{pic:([^}]+)}}/;
        const match = lineStr.match(regex);
        if (match) {
            return match[1];
        }
        return "";
    }
    onClickClose() {
        window.close();
    }
    onClickImg(evt) {
    }
    static get PrefabStr() {
        return PrefabStr;
    }
};