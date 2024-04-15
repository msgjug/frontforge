
export class Subject {
    protected _obs: SubjectListener[] = [];

    once(eventName: string, callback: (msg: any, eventName: string) => void, target: any): SubjectListener {
        let ls = this.on(eventName, callback, target);
        ls.isOnce = true;
        return ls;
    }

    on(eventName: string, callback: (msg: any, eventName: string) => void, target: any): SubjectListener {
        let sl = new SubjectListener();
        sl.eventName = eventName;
        sl.callback = callback;
        sl.target = target;
        sl.isOnce = false;
        this._obs.push(sl);
        return sl;
    }

    off(eventName: string, callback: (msg: any, eventName: string) => void, target: any): void {
        for (var i = 0; i < this._obs.length; i++) {
            let listener = this._obs[i];
            if (listener.eventName != eventName) {
                continue;
            }
            if (listener.callback != callback) {
                continue;
            }

            if (listener.target === target) {
                this._obs.splice(i, 1);
                i--;
            }
        }
    }

    targetOff(target: any) {
        for (var i = 0; i < this._obs.length; i++) {
            let listener = this._obs[i];
            if (listener.target === target) {
                this._obs.splice(i, 1);
                i--;
            }
        }
    }

    emit(eventName: string, msg?: any) {
        for (var i = 0; i < this._obs.length; i++) {
            let listener = this._obs[i];
            if (listener.eventName === eventName && listener.callback) {
                listener.callback.call(listener.target, msg, eventName);
                if (listener.isOnce) {
                    this._obs.splice(i, 1);
                    i--;
                }
            }
        }
    }

};

export class SubjectListener {
    eventName = "";
    callback: (msg: any, eventName: string) => void = null;
    target: any = null;
    isOnce: boolean = false;
};

let MsgHub = new Subject();
export default MsgHub;