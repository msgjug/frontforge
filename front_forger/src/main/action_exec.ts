import cp from "child_process";
import iconv from "iconv-lite";

//执行任务
export default class ActionExec {
    cwd = ""; //工作目录。
    comp: cp.ChildProcessWithoutNullStreams = null!; //cp.spawn返回对象
    _stdout = ""; //输出
    get stdout() {
        return this._stdout;
    }
    set stdout(str: string) {
        this._stdout = str;
    }
    stderr = "";//输出(error)
    constructor(cwd: string) {
        this.cwd = cwd;
    }
    onEnd: (str: string) => void = null!; //CMD执行结束回调
    onData: (str: string, delta: string) => void = null!; //控制台输出回调
    onError: (str: string, delta: string) => void = null!; //控制台输出回调(error)
    /**
     * 执行命令
     * @param cmd 命令，有一些需要加  xxxx.cmd
     * @param args 命令的参数。
     */
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
                this.comp.on("exit", ok);
            });
        }
        catch (e) {
            console.log("end error, because:", JSON.stringify(e));
        }
        this.comp = null;
        this.onEnd && this.onEnd(this.stdout);
    }
    /**
     * 杀死进程
     */
    kill() {
        if (this.comp) {
            if (!this.comp.kill('SIGTERM')) {
                console.error("fail to kill child process!");
            }
            this.comp = null!;
        }
    }
};