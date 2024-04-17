import cp from "child_process";
import iconv from "iconv-lite";

//执行任务
export default class ActionExec {
    cwd = ""; //工作目录。
    args: { [key: string]: string } = {};
    comp: cp.ChildProcessWithoutNullStreams = null!;
    _stdout = "";
    get stdout() {
        return this._stdout;
    }
    set stdout(str: string) {
        this._stdout = str;
    }
    stderr = "";
    constructor(cwd: string, args: { [key: string]: string } = {}) {
        this.args = args;
        this.cwd = cwd;
    }
    onEnd: (str: string) => void = null!;
    onData: (str: string, delta: string) => void = null!;
    async cmd(cmd: string, args: string[] = []) {
        let stdout = this.stdout;
        let _id = setInterval(() => {
            if (this.stdout !== stdout) {
                this.stdout = stdout;
            }
        }, 500);
        try {
            await new Promise<void>((ok) => {
                this.comp = cp.spawn(cmd, args, {
                    cwd: this.cwd
                });
                this.comp.stdout.on("data", (value) => {
                    let str = "";
                    if (process.platform === "win32") {
                        str = iconv.decode(value, "gbk");
                    }
                    else {
                        str = iconv.decode(value, "utf8");
                    }
                    str = str.trim();
                    stdout += str + "\n";
                    this.onData && this.onData(stdout, str);
                });
                this.comp.stdout.on("error", () => {
                    console.log("stream error");
                })
                this.comp.stdout.on("pause", () => {
                    console.log("stream pause");
                })
                this.comp.stdout.on("end", ok);
                this.comp.stdout.on("close", ok);
                this.comp.stderr.on("error", ok);

                this.comp.stderr.on("data", (chunk) => {
                    console.error("comp err:", chunk.toString());
                });
                this.comp.stderr.on("end", () => {
                    console.error("err end");
                    ok();
                });
                this.comp.stderr.on("close", () => {
                    console.error("err close");
                    ok();
                });
                this.comp.stderr.on("error", (err) => {
                    console.error("err:", err);
                    ok();
                });
            });
        }
        catch (e) {
            console.log("what:", JSON.stringify(e));
        }
        clearInterval(_id);

        this.onEnd && this.onEnd(this.stdout);
    }

    kill() {
        if (this.comp) {
            if( !this.comp.kill('SIGTERM')){
                console.error("fail to kill child process!");
            }
            this.comp = null!;
        }
    }
};