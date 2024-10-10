import JSZip from "jszip";
import { Col } from "../core/data_ext";

export default class ZipPackage {
    zip: JSZip = null;
    fileList: string[] = [];
    init(zip: JSZip) {
        this.zip = zip;
        this.fileList = [];
        for (let key in this.zip.files) {
            this.fileList.push(key);
        }
    }
    protected _assets: Col<Col<any>> = {};
    protected async _getAsset(url: string, type: JSZip.OutputType) {
        if (!this.fileList.includes(url)) {
            console.error("ZipPackage 找不到文件" + url);
            return null;
        }
        if (this._assets[url] && this._assets[url][type]) {
            return this._assets[url][type];
        }
        let asset = await this.zip.file(url).async(type);
        if (!this._assets[url]) {
            this._assets[url] = {};
        }
        this._assets[url][type] = asset;
        return asset;
    }

    static async FetchPackage(packageUrl: string) {
        try {
            let res = await fetch(packageUrl);
            let blob = await res.blob();
            let jszip = JSZip();
            let zip = await jszip.loadAsync(blob);
            let zp = new ZipPackage();
            zp.init(zip);
            return zp;
        }
        catch (err) {
            console.error(err);
            return null;
        }
    }

    async getBase64(url: string) {
        let ext = url.substring(url.lastIndexOf(".") + 1, url.length);
        return `data:image/${ext};base64,` + await this._getAsset(url, "base64");
    }
    async getBlob(url: string) {
        return await this._getAsset(url, "blob");
    }
    async getString(url: string) {
        return await this._getAsset(url, "string");
    }
    async getJson(url: string) {
        return JSON.parse(await this._getAsset(url, "string"));
    }

};