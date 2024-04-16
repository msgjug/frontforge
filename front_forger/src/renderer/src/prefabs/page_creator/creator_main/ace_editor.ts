import { AppNode } from "../../../core/app_node";
import { RegClass } from "../../../core/serialize";
import EditorEnv from "../../../env";
import PrefabStr from "./ace_editor.prefab.html?raw"

@RegClass("ACEEditor")
export default class ACEEditor extends AppNode {
    ace: any = null;

    onLoad(): void {
        this.ace = EditorEnv.CreateEditor(this.ele);
    }
    setTheme(theme: string) {
        this.ace.setTheme(`ace/theme/${theme}`);
    }
    setFontSize(size:number) {
        this.ace.setFontSize(`${size}px`);
    }

    setMode(mode: string) {
        this.ace.session.setMode(`ace/mode/${mode}`);
    }

    setValue(val){
      this.ace.setValue(val);
      this.ace.session.selection.selectFileStart();
      this.ace.session.selection.toggleBlockSelection();
    }

    hide(){
        this.ele.style.display = "none";
    }

    show(){
        this.ele.style.display = "";
    }

    static get PrefabStr(): string {
        return PrefabStr;
    }
};