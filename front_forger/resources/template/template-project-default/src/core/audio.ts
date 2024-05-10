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


    play(path: string) {
        this.__dom.src = path;
        this.__dom.oncanplay = () => {
            this.__dom.play();
        }
    }
};