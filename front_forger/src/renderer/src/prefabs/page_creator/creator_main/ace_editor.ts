import { AppNode } from "../../../core/app_node";
import { RegClass } from "../../../core/serialize";
import { Syncer } from "../../../core/utils";
import EditorEnv from "../../../env";
import PrefabStr from "./ace_editor.prefab.html?raw"

@RegClass("ACEEditor")
export default class ACEEditor extends AppNode {
    ace: any = null;
    _syncCalls: [string, any[]][] = [];

    async onLoad() {
        this.ace = await EditorEnv.CreateEditor(this.ele);

        if (this._syncCalls) {
            this._syncCalls.forEach(c => {
                this[c[0]](...c[1]);
            });
        }
        this._syncCalls = [];
    }
    setTheme(theme: string) {
        if (!this.ace) {
            this._syncCalls.push(["setTheme", [theme]]);
            return;
        }
        this.ace.setTheme(`ace/theme/${theme}`);
    }
    setFontSize(size: number) {
        if (!this.ace) {
            this._syncCalls.push(["setFontSize", [size]]);
            return;
        }
        this.ace.setFontSize(`${size}px`);
    }

    setMode(mode: string) {
        if (!this.ace) {
            this._syncCalls.push(["setMode", [mode]]);
            return;
        }
        this.ace.session.setMode(`ace/mode/${mode}`);
    }

    _wrapMode = false;
    get wrapMode() {
        return this._wrapMode;
    }
    set wrapMode(val) {
        this._wrapMode = val;
        this.ace.getSession().setUseWrapMode(this._wrapMode);
    }

    getValue() {
        return this.ace.getValue();
    }

    setValue(val) {
        this.ace.setValue(val);
        this.ace.session.selection.selectFileStart();
        this.ace.session.selection.toggleBlockSelection();
    }

    hide() {
        this.ele.style.display = "none";
    }

    show() {
        this.ele.style.display = "";
    }

    resize() {
        if (!this.ace) {
            this._syncCalls.push(["resize", []]);
            return;
        }
        this.ace.resize();
    }

    static get PrefabStr(): string {
        return PrefabStr;
    }
};