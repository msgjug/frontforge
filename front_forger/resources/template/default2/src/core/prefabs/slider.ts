import { AppNode } from "../app_node";
import { RegClass } from "../serialize";
import { H5Utils } from "../utils";
import PrefabStr from "./slider.prefab.html?raw";

@RegClass("Slider")
export default class Slider extends AppNode {
    input: HTMLInputElement = null; //隐藏的input
    track: HTMLDivElement = null;
    trackFill: HTMLDivElement = null;
    thumb: HTMLDivElement = null;
    lbName: HTMLSpanElement = null;
    lb: HTMLSpanElement = null;
    onLoad(): void {
        this.input.addEventListener('input', () => {
            this.__updateThumbPosition(this.input.value);
        });
        // 初始化滑块位置
        this.__updateThumbPosition(this.input.value);

        if (H5Utils.IsMobile) {
            this.thumb.addEventListener('touchstart', this.__touching.bind(this));
        }
        else {
            this.thumb.addEventListener('mousedown', this.__touching.bind(this));
        }
    }

    //释放
    onChanged() {
        this.subject.emit("changed", this.input.value);
    }
    //拖动
    onInput() {
        this.subject.emit("input", this.input.value);
        this.lb.innerText = `${this.input.value}%`;
    }

    private __touching(e) {
        e.preventDefault();
        var sliderWidth = this.track.offsetWidth;
        // var pageX = e.pageX || e.touches[0].pageX;
        const mouseMoveHandler = (e) => {
            var newX = e.clientX - this.thumb.clientWidth;
            var percent = (newX - this.track.offsetLeft) / sliderWidth;
            //@ts-ignore
            this.input.value = Math.round(percent * (this.input.max - this.input.min) + this.input.min);
            this.__updateThumbPosition(this.input.value);
            this.onInput();
        };
        const touchMoveHandler = (e) => {
            var newX = e.touches[0].clientX;
            var percent = (newX - this.track.offsetLeft) / sliderWidth;
            //@ts-ignore
            this.input.value = Math.round(percent * (this.input.max - this.input.min) + this.input.min);
            this.__updateThumbPosition(this.input.value);
            this.onInput();
        };
        const mouseUpHandler = () => {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
            this.onChanged();
        };
        const touchEndHandler = () => {
            document.removeEventListener('touchmove', touchMoveHandler);
            document.removeEventListener('touchend', touchEndHandler);
            this.onChanged();
        };

        if (H5Utils.IsMobile) {
            document.addEventListener('touchmove', touchMoveHandler);
            document.addEventListener('touchend', touchEndHandler);
        }
        else {
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        }
    }
    private __updateThumbPosition(value: string) {
        let num = Number(value);

        var percent = (num - Number(this.input.min)) / (Number(this.input.max) - Number(this.input.min));
        this.thumb.style.left = `calc(${percent} * calc(100% - ${this.thumb.clientWidth}px))`;

        this.trackFill.style.width = `calc( ${percent * 100}% - ${(percent-0.5) * this.thumb.clientWidth}px)`;

    }
    static get __BindPrefab__(): string {
        return PrefabStr;
    }
};