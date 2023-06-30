import Macro from "./macro";

export type NetData = boolean | number | string;
//todo: 完善请求属性，满足更多需求。
export class HttpRequest {
    url: string = "";
    urlRaw: string = "";
    type: string = "GET";
    rspType: string = "json";
    contentType: "application/json" | "application/x-www-form-urlencoded" | "multipart/form-data";
    param: { [key: string]: NetData } = {};
    body: any = null;
    headers: { [key: string]: string } = {
        "Accept": "*/*",
    };
    timeout: number = 5000;
    async: boolean = true;

    static Post(pathKey: string) {
        let req = new HttpRequest(pathKey);
        req.type = "POST";
        req.contentType = "application/json";
        return req;
    }
    static Get(pathKey: string) {
        let req = new HttpRequest(pathKey);
        req.type = "GET";
        req.contentType = "application/x-www-form-urlencoded";
        return req;
    }
    constructor(pathKeyOrPath?: string) {
        if (pathKeyOrPath) {
            if (Macro.HTTP.APIS[pathKeyOrPath]) {
                this.url = Macro.HTTP.APIS[pathKeyOrPath];
            }
            else {
                this.urlRaw = pathKeyOrPath;
            }
        }
    }

    setBody(body: any) {
        this.body = body;
        return this;
    }
    setParam(param: { [key: string]: NetData }) {
        this.param = param;
        return this;
    }
    setHeader(headers: { [key: string]: string }) {
        Object.assign(this.headers, headers);
        // this.headers = headers;
        return this;
    }

    reqPromise() {
        return new Promise<any>((ok, fail) => {
            Http.req(this, ok, fail);
        });
    }
};

export class Http {
    static getRemoveAppVersionPath() {
        return this.getH5Path() + Macro.HTTP.APIS.REMOTE_APP_VERSION + "?time=" + Date.now();
    }
    static getRemoveVersionPath() {
        return this.getH5Path() + Macro.HTTP.APIS.REMOTE_VERSION + "?time=" + Date.now();
    }
    static getRemoteBundlePath() {
        return this.getH5Path() + Macro.HTTP.APIS.REMOTE_BUNDLE_PATH;
    }
    static getFullPathByKey(key: string) {
        return Http.getFullPath(Macro.HTTP.APIS[key]);
    }
    static getFullPath(part: string) {
        return `${this.getHttpProtocol()}${Macro.HTTP.DOMAIN}/${Macro.HTTP.PATH}/${part}`;
    }
    static getH5Path() {
        return `${this.getHttpProtocol()}${Macro.HTTP.DOMAIN}/${Macro.HTTP.PATH}/`;
    }

    static getHttpProtocol() {
        return window.location.href.indexOf('https://') > -1 ? "https://" : "http://";
    }

    static download(option: HttpRequest, success: any, error: any) {
        let request = new XMLHttpRequest();
        request.timeout = option.timeout;
        let reqUrl = Http.getFullPath(option.url) || option.urlRaw;

        let xhr = new XMLHttpRequest();
        xhr.open('GET', reqUrl, true);
        // xhr.setRequestHeader("Content-Type", 'application/json;charset=utf-8');
        xhr.responseType = 'blob';
        xhr.onload = function (e) {
            if (this.status == 200) {
                let blob = xhr.response;
                success(blob);
            }
        };
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
            }
        };
        xhr.send();
    }

    static req(option: HttpRequest, success: any, error: any) {
        let request = new XMLHttpRequest();
        request.timeout = option.timeout;

        let reqUrl = Http.getFullPath(option.url);

        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                let status = request.status;
                let rspSuccess = true;
                if (status >= 200 && status < 400) {
                    let rsp: any = request.responseText;
                    if (option.rspType == "json") {
                        try {
                            rsp = JSON.parse(request.responseText);
                        }
                        catch (e) {
                            console.warn("Http::req, warn:", "返回的数据JSON解析失败", e);
                            rspSuccess = false;
                        }
                    }

                    if (rsp && rspSuccess) {
                        console.log(`http, ${reqUrl}, ok:`, rsp);
                        success && success(rsp);
                    }
                    else {
                        console.log(`http, ${reqUrl}, fail:`, rsp);
                        error && error(rsp);
                        return;
                    }

                }
                else {
                    error(status);
                }
            }
        };

        request.onerror = function () {
            error("net-error");
        };

        request.ontimeout = function () {
            error("timeout");
        };

        var body = null;
        if (option.body) {
            body = option.body;
        }

        if (option.param) {
            if (body && option.type === "POST" && option.contentType === "application/x-www-form-urlencoded") {
                Object.assign(option.param, option.body);
            }
            let sim = "?";
            for (let key in option.param) {
                reqUrl += sim + key + "=" + option.param[key];
                sim = "&";
            }
        }

        request.open(option.type, reqUrl, option.async);

        if (option.headers) {
            for (let key in option.headers) {
                request.setRequestHeader(key, option.headers[key]);
            }
            request.setRequestHeader("Content-Type", option.contentType);
        }

        if (body) {
            switch (option.contentType) {
                case "application/json":
                    request.send(JSON.stringify(body));
                    break;
                case "application/x-www-form-urlencoded":
                    request.send();
                    break;
                case "multipart/form-data":
                    request.send(body);
                    break;
            }
        }
        else {
            request.send();
        }
    }
};

//@ts-ignore
window["http"] = Http;