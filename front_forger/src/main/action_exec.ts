import cp from "child_process";
import iconv from "iconv-lite";
import fs from 'fs';

//执行任务
export default class ActionExec {
    cwd = ""; //工作目录。
    args: { [key: string]: string } = {};

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
                var comp = cp.spawn(cmd, args, {
                    cwd: this.cwd
                });
                comp.stdout.on("data", (value) => {
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
                comp.stdout.on("error", () => {
                    console.log("stream error");
                })
                comp.stdout.on("pause", () => {
                    console.log("stream pause");
                })
                comp.stdout.on("end", ok);
                comp.stdout.on("close", ok);
                comp.stderr.on("error", ok);

                comp.stderr.on("data", (chunk) => {
                    console.error("comp err:", chunk.toString());
                });
                comp.stderr.on("end", () => {
                    console.error("err end");
                    ok();
                });
                comp.stderr.on("close", () => {
                    console.error("err close");
                    ok();
                });
                comp.stderr.on("error", (err) => {
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
};