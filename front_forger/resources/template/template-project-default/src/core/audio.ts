export class Audio {
    private __dom: HTMLAudioElement = null;
    private static __ins: Audio = null;

    private constructor() {
        this.__dom = document.createElement("audio");
        this.__dom.style.display = "none";
        document.body.appendChild(this.__dom);
    }
    static get ins() {
        if (!Audio.__ins) {
            Audio.__ins = new Audio();
        }
        return Audio.__ins;
    }

    volume = 1; //0-1
    play(path: string) {
        this.__dom.src = path;
        this.__dom.volume = this.volume;
        this.__dom.oncanplay = () => {
            this.__dom.play();
        }
    }
};