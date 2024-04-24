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
    onError: (str: string, delta: string) => void = null!;
    async cmd(cmd: string, args: string[] = []) {
        try {
            await new Promise<number>((ok) => {
                this.comp = cp.spawn(cmd, args, {
                    cwd: this.cwd
                });

                this.comp.stdout.on('data', (data) => {
                    let str = "";
                    if (process.platform === "win32") {
                        str = iconv.decode(data, "gbk");
                    }
                    else {
                        str = iconv.decode(data, "utf8");
                    }
                    this.stdout += data;
                    this.onData && this.onData(this.stdout, str);
                });

                this.comp.stderr.on('data', (data) => {
                    let str = "";
                    if (process.platform === "win32") {
                        str = iconv.decode(data, "gbk");
                    }
                    else {
                        str = iconv.decode(data, "utf8");
                    }

                    this.stderr += data;
                    this.onError && this.onError(this.stderr, str);
                });
                this.comp.on('close', ok);
            });
        }
        catch (e) {
            console.log("end error, because:", JSON.stringify(e));
        }

        this.onEnd && this.onEnd(this.stdout);
    }

    kill() {
        if (this.comp) {
            if (!this.comp.kill()) {
                console.error("fail to kill child process!");
            }
            this.comp = null!;
        }
    }
};