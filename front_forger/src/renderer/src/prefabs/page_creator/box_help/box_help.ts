import { AppNode } from "../../../core/app_node";
import { RegClass } from "../../../core/serialize";
import PrefabStr from "./box_help.prefab.html?raw"


@RegClass("BoxHelp")
export default class BoxHelp extends AppNode {
    docTitles: HTMLDivElement[] = [];
    main: HTMLDivElement = null;
    onClickDoc(evt) {
        let tag = evt.target.getAttribute("doc");
        this.showDoc(tag);
    }
    async fetchTextFile(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const content = await response.text();
            return content; // 返回文本文件的内容
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            throw error; // 抛出错误，让调用者知道发生了问题
        }
    }

    onLoad(): void {
        this.showDoc("first");
    }
    async showDoc(tag) {
        this.docTitles.forEach((ele, ind) => {
            if (ele.getAttribute("doc") === tag) {
                ele.setAttribute("cur", "");
            }
            else {
                ele.removeAttribute("cur");
            }
        })
        let docStr = await this.fetchTextFile(`./docs/${tag}.txt`);
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