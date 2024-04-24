export enum DataType {
    Int8 = 1,
    UInt8 = 2,
    Int16 = 3,
    UInt16 = 4,
    Int32 = 5,
    UInt32 = 6,
    //big int
    UInt64 = 7,
    Int64 = 8,

    Float32 = 9,
    Float64 = 10,
};

const TypeSize = {
    1: 1,
    2: 1,
    3: 2,
    4: 2,
    5: 4,
    6: 4,
    //big int
    7: 8,
    8: 8,

    9: 4,
    10: 8,
};

const USE_LITTLE_ENDIAN = false;

export class GrowBuffer {
    protected _sizeStep = 64;
    protected _size = 64;
    protected _buf: ArrayBuffer = null;
    protected _seek = 0;


    get seek() {
        return this._seek;
    }
    set seek(val) {
        this._seek = val;
    }
    view: DataView = null;

    constructor(inputBuf?: ArrayBuffer) {
        if (inputBuf) {
            this._buf = inputBuf;
            this._size = inputBuf.byteLength;
        }
        else {
            this._buf = new ArrayBuffer(this._size);
        }
        this.view = new DataView(this._buf);
    }
    resize(newSize: number) {
        var dst = new ArrayBuffer(newSize);
        this._size = newSize;
        new Uint8Array(dst).set(new Uint8Array(this._buf));
        this._buf = dst;
        this.view = new DataView(this._buf);
    }
    _needResize(condSize: number) {
        return (condSize >= this._size);
    }
    /**
     * 
     * @param {DataType} dataType 
     * @returns 
     */
    read(dataType: DataType): number | bigint {
        let data;
        switch (dataType) {
            case DataType.UInt8:
                data = this.view.getUint8(this.seek);
                break;
            case DataType.Int8:
                data = this.view.getInt8(this.seek);
                break;
            case DataType.UInt16:
                data = this.view.getUint16(this.seek, USE_LITTLE_ENDIAN);
                break;
            case DataType.Int16:
                data = this.view.getInt16(this.seek, USE_LITTLE_ENDIAN);
                break;
            case DataType.UInt32:
                data = this.view.getUint32(this.seek, USE_LITTLE_ENDIAN);
                break;
            case DataType.Int32:
                data = this.view.getInt32(this.seek, USE_LITTLE_ENDIAN);
                break;
            case DataType.UInt64:
                data = this.view.getBigUint64(this.seek, USE_LITTLE_ENDIAN);
                break;
            case DataType.Int64:
                data = this.view.getBigInt64(this.seek, USE_LITTLE_ENDIAN);
                break;
            case DataType.Float32:
                data = this.view.getFloat32(this.seek, USE_LITTLE_ENDIAN);
                break;
            case DataType.Float64:
                data = this.view.getFloat64(this.seek, USE_LITTLE_ENDIAN);
                break;
        }
        this.seek += TypeSize[dataType];
        return data;
    }
    readUint8() {
        return <number>this.read(DataType.UInt8);
    }
    readInt8() {
        return <number>this.read(DataType.Int8);
    }
    readBool() {
        return !!this.read(DataType.UInt8);
    }
    readUint16() {
        return <number>this.read(DataType.UInt16);
    }
    readInt16() {
        return <number>this.read(DataType.Int16);
    }
    readUint32() {
        return <number>this.read(DataType.UInt32);
    }
    readInt32() {
        return <number>this.read(DataType.Int32);
    }
    readUint64() {
        return <bigint>this.read(DataType.UInt64);
    }
    readInt64() {
        return <bigint>this.read(DataType.Int64);
    }
    readFloat() {
        return <number>this.read(DataType.Float32);
    }
    readDouble() {
        return <number>this.read(DataType.Float64);
    }

    /**
     * 
     * @param {Uint8Array} u8
     */
    writeUint8Array(u8) {
        let len = u8.length
        this.writeInt32(len);

        let dataSize = TypeSize[DataType.UInt8] * len;
        while (this._needResize(this.seek + dataSize)) {
            this.resize(this._size + this._sizeStep);
        }
        let srcU8 = new Uint8Array(this._buf);
        srcU8.set(u8, this.seek);
        this.seek += dataSize;
    }
    /**
     * 
     * @returns { Uint8Array }
     */
    readUint8Array() {
        let len: number = <number>this.readInt32();
        let dataSize = TypeSize[DataType.UInt8] * len;
        let u8 = new Uint8Array(this._buf.slice(this.seek, this.seek + dataSize));
        this.seek += dataSize;
        return u8;
    }
    /**
     * 
     * @param {number} data 0-255
     */
    writeUint8(data) {
        if (data < 0 || data > 255) {
            throw Error("value need <= 255 or > 0");
        }
        let dataSize = TypeSize[DataType.UInt8];
        while (this._needResize(this.seek + dataSize)) {
            this.resize(this._size + this._sizeStep);
        }
        this.view.setUint8(this.seek, data);
        this.seek += dataSize;
    }
    writeBool(data) {
        let dataSize = TypeSize[DataType.UInt8];
        while (this._needResize(this.seek + dataSize)) {
            this.resize(this._size + this._sizeStep);
        }
        this.view.setUint8(this.seek, data ? 1 : 0);
        this.seek += dataSize;
    }
    writeInt8(data) {
        if (data < -127 || data > 127) {
            throw Error("value need <= -127 or > 127");
        }
        let dataSize = TypeSize[DataType.Int8];
        while (this._needResize(this.seek + dataSize)) {
            this.resize(this._size + this._sizeStep);
        }
        this.view.setInt8(this.seek, data);
        this.seek += dataSize;
    }
    writeUint16(data) {
        //最大最小检查
        // if (data < -127 || data > 127) {
        //     throw Error("value need <= -127 or > 127");
        // }
        let dataSize = TypeSize[DataType.UInt16];
        while (this._needResize(this.seek + dataSize)) {
            this.resize(this._size + this._sizeStep);
        }
        this.view.setUint16(this.seek, data, USE_LITTLE_ENDIAN);
        this.seek += dataSize;
    }
    writeInt16(data) {
        //最大最小检查
        // if (data < -127 || data > 127) {
        //     throw Error("value need <= -127 or > 127");
        // }
        let dataSize = TypeSize[DataType.Int16];
        while (this._needResize(this.seek + dataSize)) {
            this.resize(this._size + this._sizeStep);
        }
        this.view.setInt16(this.seek, data, USE_LITTLE_ENDIAN);
        this.seek += dataSize;
    }
    writeUint32(data) {
        //最大最小检查
        // if (data < -127 || data > 127) {
        //     throw Error("value need <= -127 or > 127");
        // }
        let dataSize = TypeSize[DataType.UInt32];
        while (this._needResize(this.seek + dataSize)) {
            this.resize(this._size + this._sizeStep);
        }
        this.view.setUint32(this.seek, data, USE_LITTLE_ENDIAN);
        this.seek += dataSize;
    }
    writeInt32(data) {
        //最大最小检查
        // if (data < -127 || data > 127) {
        //     throw Error("value need <= -127 or > 127");
        // }
        let dataSize = TypeSize[DataType.Int32];
        while (this._needResize(this.seek + dataSize)) {
            this.resize(this._size + this._sizeStep);
        }
        this.view.setInt32(this.seek, data, USE_LITTLE_ENDIAN);
        this.seek += dataSize;
    }
    /**
     * 
     * @param {bigint} data 
     */
    writeUint64(data) {
        let dataSize = TypeSize[DataType.UInt64];
        while (this._needResize(this.seek + dataSize)) {
            this.resize(this._size + this._sizeStep);
        }
        this.view.setBigUint64(this.seek, data, USE_LITTLE_ENDIAN);
        this.seek += dataSize;
    }
    /**
     * 
     * @param {bigint} data 
     */
    writeInt64(data) {
        let dataSize = TypeSize[DataType.Int64];
        while (this._needResize(this.seek + dataSize)) {
            this.resize(this._size + this._sizeStep);
        }
        this.view.setBigInt64(this.seek, data, USE_LITTLE_ENDIAN);
        this.seek += dataSize;
    }
    /**
     * 
     * @param {Float32} data 
     */
    writeFloat(data) {

        let dataSize = TypeSize[DataType.Float32];
        while (this._needResize(this.seek + dataSize)) {
            this.resize(this._size + this._sizeStep);
        }
        this.view.setFloat32(this.seek, data, USE_LITTLE_ENDIAN);
        this.seek += dataSize;
    }
    /**
     * 
     * @param {Float64} data 
     */
    writeDouble(data) {
        let dataSize = TypeSize[DataType.Float64];
        while (this._needResize(this.seek + dataSize)) {
            this.resize(this._size + this._sizeStep);
        }
        this.view.setFloat64(this.seek, data, USE_LITTLE_ENDIAN);
        this.seek += dataSize;
    }

    /**
     * 
     * @param {string} data 
     */
    writeString(data) {
        let ab = GrowBufferImpl._writeString(data);
        let u8 = new Uint8Array(ab);
        this.writeInt32(u8.length);
        for (let i = 0; i < u8.length; i++) {
            this.writeUint8(u8[i]);
        }
    }

    readString() {
        let len = this.readUint32();
        let dataSize = len * TypeSize[DataType.UInt8];
        let ab = this._buf.slice(this.seek, this.seek + Number(dataSize));
        let u8 = new Uint8Array(ab);
        let dataString = GrowBufferImpl._readString(u8);
        this.seek += dataSize;
        return dataString;
    }
};



class GrowBufferImpl {
    static _readString(bytes) {
        var ix = 0;

        if (bytes.slice(0, 3) == "\xEF\xBB\xBF") {
            ix = 3;
        }

        var string = "";
        for (; ix < bytes.length; ix++) {
            var byte1 = bytes[ix];
            if (byte1 < 0x80) {
                string += String.fromCharCode(byte1);
            } else if (byte1 >= 0xC2 && byte1 < 0xE0) {
                var byte2 = bytes[++ix];
                string += String.fromCharCode(((byte1 & 0x1F) << 6) + (byte2 & 0x3F));
            } else if (byte1 >= 0xE0 && byte1 < 0xF0) {
                var byte2 = bytes[++ix];
                var byte3 = bytes[++ix];
                string += String.fromCharCode(((byte1 & 0xFF) << 12) + ((byte2 & 0x3F) << 6) + (byte3 & 0x3F));
            } else if (byte1 >= 0xF0 && byte1 < 0xF5) {
                var byte2 = bytes[++ix];
                var byte3 = bytes[++ix];
                var byte4 = bytes[++ix];
                var codepoint = ((byte1 & 0x07) << 18) + ((byte2 & 0x3F) << 12) + ((byte3 & 0x3F) << 6) + (byte4 & 0x3F);
                codepoint -= 0x10000;
                string += String.fromCharCode(
                    (codepoint >> 10) + 0xD800, (codepoint & 0x3FF) + 0xDC00
                );
            }
        }

        return string;
    }

    static _appendUint8(buf, value) {
        if (value > 255) {
            throw Error("value need <= 255");
        }
        buf.push(value);
    }
    static _pushUnicodeWithUtf8(buf, value) {
        // console.log("encodeUnicode value=" + value);
        if (value <= 0x7F) {
            this._appendUint8(buf, value);
        } else if (value <= 0xFF) {
            this._appendUint8(buf, (value >> 6) | 0xC0);
            this._appendUint8(buf, (value & 0x3F) | 0x80);
        } else if (value <= 0xFFFF) {
            this._appendUint8(buf, (value >> 12) | 0xE0);
            this._appendUint8(buf, ((value >> 6) & 0x3F) | 0x80);
            this._appendUint8(buf, (value & 0x3F) | 0x80);
        } else if (value <= 0x1FFFFF) {
            this._appendUint8(buf, (value >> 18) | 0xF0);
            this._appendUint8(buf, ((value >> 12) & 0x3F) | 0x80);
            this._appendUint8(buf, ((value >> 6) & 0x3F) | 0x80);
            this._appendUint8(buf, (value & 0x3F) | 0x80);
        } else if (value <= 0x3FFFFFF) {//后面两种情况一般不大接触到，看了下protobuf.js中的utf8，他没去实现
            this._appendUint8(buf, (value >> 24) | 0xF8);
            this._appendUint8(buf, ((value >> 18) & 0x3F) | 0x80);
            this._appendUint8(buf, ((value >> 12) & 0x3F) | 0x80);
            this._appendUint8(buf, ((value >> 6) & 0x3F) | 0x80);
            this._appendUint8(buf, (value & 0x3F) | 0x80);
        } else {//Math.pow(2, 32) - 1
            this._appendUint8(buf, (value >> 30) & 0x1 | 0xFC);
            this._appendUint8(buf, ((value >> 24) & 0x3F) | 0x80);
            this._appendUint8(buf, ((value >> 18) & 0x3F) | 0x80);
            this._appendUint8(buf, ((value >> 12) & 0x3F) | 0x80);
            this._appendUint8(buf, ((value >> 6) & 0x3F) | 0x80);
            this._appendUint8(buf, (value & 0x3F) | 0x80);
        }
    }
    static _parseUnicodeFromUtf16(ch1, ch2) {
        if ((ch1 & 0xFC00) === 0xD800 && (ch2 & 0xFC00) === 0xDC00) {
            return { unicode: (((ch1 & 0x3FF) << 10) | (ch2 & 0x3FF)) + 0x10000, ok: true }
        }
        return { ok: false }
    }
    /**
     * 
     * @param {string} value 
     * @returns {ArrayBuffer} ab
     */
    static _writeString(value) {
        let tmpBuf = [];
        for (let i = 0; i < value.length; i++) {
            let ch1 = value.charCodeAt(i);
            // console.log("pushStringWithUtf8 i=" + i + ",ch1=" + ch1 + "," + ch1.toString(16).toUpperCase());
            if (ch1 < 128)
                this._pushUnicodeWithUtf8(tmpBuf, ch1);
            else if (ch1 < 2048) {
                this._pushUnicodeWithUtf8(tmpBuf, ch1);
            } else {
                let ch2 = value.charCodeAt(i + 1);
                // console.log("pushStringWithUtf8 i=" + i + ",ch2=" + ch2 + "," + ch2.toString(16).toUpperCase());
                let unicodeRes = this._parseUnicodeFromUtf16(ch1, ch2);
                // console.log("unicodeOk=" + JSON.stringify(unicodeOk));
                if (unicodeRes.ok) {
                    this._pushUnicodeWithUtf8(tmpBuf, unicodeRes.unicode);
                    i++;
                } else {
                    this._pushUnicodeWithUtf8(tmpBuf, ch1);
                }
            }
        }
        var ab = new ArrayBuffer(tmpBuf.length);
        new Uint8Array(ab).set(new Uint8Array(tmpBuf));
        return ab;
    }
};


export abstract class Protocol {
    abstract toMixed(): any;
    toField():any {
        let out = this.toMixed();
        if(out["__cn"]){
            delete out["__cn"];
        }
        return out;
    }
    abstract fromMixed(input: any): void;
    toBinary(): Uint8Array {
        let gBuf = new GrowBuffer();
        this._toBinary(gBuf);
        return new Uint8Array(gBuf.view.buffer);
    }
    fromBinary(input: Uint8Array) {
        let gBuf = new GrowBuffer(input.buffer);
        this._fromBinary(gBuf);
    }

    protected abstract _toBinary(gBuf: GrowBuffer): void;
    protected abstract _fromBinary(gBuf: GrowBuffer): void;

    getClassName(){
      return "Protocol";
    }
    toString(){
      return JSON.stringify(this.toMixed());
    }
};
//枚举

//消息协议

export class ProtocolObjectPrefabConfig extends Protocol {
    name : string = "";group : string = "";

    getClassName(){
        return "PrefabConfig"
    }
    toMixed() {
        let out: any = {};
        out["__cn"] = this.getClassName();
        out["name"] = this.name;
out["group"] = this.group;

        return out;
    }
    fromMixed(input: any) {
        
        this.name = input.hasOwnProperty("name") && input["name"] !== null ? input["name"] : this.name;
this.group = input.hasOwnProperty("group") && input["group"] !== null ? input["group"] : this.group;

    }
    protected _toBinary( gBuf: GrowBuffer) {
        
        gBuf.writeString(this.getClassName());
        let __arr_size = 0;
        gBuf.writeString (this.name);
gBuf.writeString (this.group);

    }
    protected _fromBinary( gBuf: GrowBuffer ) {
        
        let __arr_size = 0;
        this.name = gBuf.readString ();
this.group = gBuf.readString ();

    }
};
export class ProtocolObjectProjectConfig extends Protocol {
    app_name : string = "";app_version : string = "";path : string = "";entrance_prefab_name : string = "";prefabs_list : ProtocolObjectPrefabConfig [] = [];create_date : number = 0;edit_date : number = 0;

    getClassName(){
        return "ProjectConfig"
    }
    toMixed() {
        let out: any = {};
        out["__cn"] = this.getClassName();
        out["app_name"] = this.app_name;
out["app_version"] = this.app_version;
out["path"] = this.path;
out["entrance_prefab_name"] = this.entrance_prefab_name;
out["prefabs_list"] = [];
this.prefabs_list.forEach(ele => {
    out["prefabs_list"].push(ele.toMixed());
});
out["create_date"] = this.create_date;
out["edit_date"] = this.edit_date;

        return out;
    }
    fromMixed(input: any) {
        
        this.app_name = input.hasOwnProperty("app_name") && input["app_name"] !== null ? input["app_name"] : this.app_name;
this.app_version = input.hasOwnProperty("app_version") && input["app_version"] !== null ? input["app_version"] : this.app_version;
this.path = input.hasOwnProperty("path") && input["path"] !== null ? input["path"] : this.path;
this.entrance_prefab_name = input.hasOwnProperty("entrance_prefab_name") && input["entrance_prefab_name"] !== null ? input["entrance_prefab_name"] : this.entrance_prefab_name;
{
    let arr: any[] = input.hasOwnProperty("prefabs_list") && input["prefabs_list"] !== null ? input["prefabs_list"] : [];
    let count = arr.length;
    for (let i = 0; i < count; i++) {
        let ele = new ProtocolObjectPrefabConfig();
    ele.fromMixed( arr[i] );
    this.prefabs_list.push( ele );
    }
}
this.create_date = input.hasOwnProperty("create_date") && input["create_date"] !== null ? input["create_date"] : this.create_date;
this.edit_date = input.hasOwnProperty("edit_date") && input["edit_date"] !== null ? input["edit_date"] : this.edit_date;

    }
    protected _toBinary( gBuf: GrowBuffer) {
        
        gBuf.writeString(this.getClassName());
        let __arr_size = 0;
        gBuf.writeString (this.app_name);
gBuf.writeString (this.app_version);
gBuf.writeString (this.path);
gBuf.writeString (this.entrance_prefab_name);
__arr_size = this.prefabs_list.length;
gBuf.writeUint32(__arr_size);
for (let i = 0; i < __arr_size; i++) {
    gBuf.writeUint8Array(this.prefabs_list[i].toBinary());
}
gBuf.writeInt32 (this.create_date);
gBuf.writeInt32 (this.edit_date);

    }
    protected _fromBinary( gBuf: GrowBuffer ) {
        
        let __arr_size = 0;
        this.app_name = gBuf.readString ();
this.app_version = gBuf.readString ();
this.path = gBuf.readString ();
this.entrance_prefab_name = gBuf.readString ();
__arr_size = gBuf.readUint32();
for (let i = 0; i < __arr_size; i++) {
    let ele = new ProtocolObjectPrefabConfig();
ele.fromBinary(gBuf.readUint8Array());
this.prefabs_list.push(ele);
}
this.create_date = gBuf.readInt32 ();
this.edit_date = gBuf.readInt32 ();

    }
};
export class ProtocolObjectEditorConfig extends Protocol {
    project_configs : ProtocolObjectProjectConfig [] = [];win_main : boolean = true;win_main_w : number = 250;win_main_h : number = 550;win_code : boolean = false;win_code_w : number = 700;win_code_h : number = 550;wrap_mode : boolean = false;theme : string = "chaos";font_size : number = 12;project_dir : string = "";

    getClassName(){
        return "EditorConfig"
    }
    toMixed() {
        let out: any = {};
        out["__cn"] = this.getClassName();
        out["project_configs"] = [];
this.project_configs.forEach(ele => {
    out["project_configs"].push(ele.toMixed());
});
out["win_main"] = this.win_main;
out["win_main_w"] = this.win_main_w;
out["win_main_h"] = this.win_main_h;
out["win_code"] = this.win_code;
out["win_code_w"] = this.win_code_w;
out["win_code_h"] = this.win_code_h;
out["wrap_mode"] = this.wrap_mode;
out["theme"] = this.theme;
out["font_size"] = this.font_size;
out["project_dir"] = this.project_dir;

        return out;
    }
    fromMixed(input: any) {
        
        {
    let arr: any[] = input.hasOwnProperty("project_configs") && input["project_configs"] !== null ? input["project_configs"] : [];
    let count = arr.length;
    for (let i = 0; i < count; i++) {
        let ele = new ProtocolObjectProjectConfig();
    ele.fromMixed( arr[i] );
    this.project_configs.push( ele );
    }
}
this.win_main = input.hasOwnProperty("win_main") && input["win_main"] !== null ? input["win_main"] : this.win_main;
this.win_main_w = input.hasOwnProperty("win_main_w") && input["win_main_w"] !== null ? input["win_main_w"] : this.win_main_w;
this.win_main_h = input.hasOwnProperty("win_main_h") && input["win_main_h"] !== null ? input["win_main_h"] : this.win_main_h;
this.win_code = input.hasOwnProperty("win_code") && input["win_code"] !== null ? input["win_code"] : this.win_code;
this.win_code_w = input.hasOwnProperty("win_code_w") && input["win_code_w"] !== null ? input["win_code_w"] : this.win_code_w;
this.win_code_h = input.hasOwnProperty("win_code_h") && input["win_code_h"] !== null ? input["win_code_h"] : this.win_code_h;
this.wrap_mode = input.hasOwnProperty("wrap_mode") && input["wrap_mode"] !== null ? input["wrap_mode"] : this.wrap_mode;
this.theme = input.hasOwnProperty("theme") && input["theme"] !== null ? input["theme"] : this.theme;
this.font_size = input.hasOwnProperty("font_size") && input["font_size"] !== null ? input["font_size"] : this.font_size;
this.project_dir = input.hasOwnProperty("project_dir") && input["project_dir"] !== null ? input["project_dir"] : this.project_dir;

    }
    protected _toBinary( gBuf: GrowBuffer) {
        
        gBuf.writeString(this.getClassName());
        let __arr_size = 0;
        __arr_size = this.project_configs.length;
gBuf.writeUint32(__arr_size);
for (let i = 0; i < __arr_size; i++) {
    gBuf.writeUint8Array(this.project_configs[i].toBinary());
}
gBuf.writeBool (this.win_main);
gBuf.writeInt32 (this.win_main_w);
gBuf.writeInt32 (this.win_main_h);
gBuf.writeBool (this.win_code);
gBuf.writeInt32 (this.win_code_w);
gBuf.writeInt32 (this.win_code_h);
gBuf.writeBool (this.wrap_mode);
gBuf.writeString (this.theme);
gBuf.writeInt32 (this.font_size);
gBuf.writeString (this.project_dir);

    }
    protected _fromBinary( gBuf: GrowBuffer ) {
        
        let __arr_size = 0;
        __arr_size = gBuf.readUint32();
for (let i = 0; i < __arr_size; i++) {
    let ele = new ProtocolObjectProjectConfig();
ele.fromBinary(gBuf.readUint8Array());
this.project_configs.push(ele);
}
this.win_main = gBuf.readBool ();
this.win_main_w = gBuf.readInt32 ();
this.win_main_h = gBuf.readInt32 ();
this.win_code = gBuf.readBool ();
this.win_code_w = gBuf.readInt32 ();
this.win_code_h = gBuf.readInt32 ();
this.wrap_mode = gBuf.readBool ();
this.theme = gBuf.readString ();
this.font_size = gBuf.readInt32 ();
this.project_dir = gBuf.readString ();

    }
};
export class ProtocolObjectIPCResponse extends Protocol {
    ret : number = 0;msg : string = "";

    getClassName(){
        return "IPCResponse"
    }
    toMixed() {
        let out: any = {};
        out["__cn"] = this.getClassName();
        out["ret"] = this.ret;
out["msg"] = this.msg;

        return out;
    }
    fromMixed(input: any) {
        
        this.ret = input.hasOwnProperty("ret") && input["ret"] !== null ? input["ret"] : this.ret;
this.msg = input.hasOwnProperty("msg") && input["msg"] !== null ? input["msg"] : this.msg;

    }
    protected _toBinary( gBuf: GrowBuffer) {
        
        gBuf.writeString(this.getClassName());
        let __arr_size = 0;
        gBuf.writeInt32 (this.ret);
gBuf.writeString (this.msg);

    }
    protected _fromBinary( gBuf: GrowBuffer ) {
        
        let __arr_size = 0;
        this.ret = gBuf.readInt32 ();
this.msg = gBuf.readString ();

    }
};
export class ProtocolObjectWindowChange extends Protocol {
    open : string = "";close : string = "";

    getClassName(){
        return "WindowChange"
    }
    toMixed() {
        let out: any = {};
        out["__cn"] = this.getClassName();
        out["open"] = this.open;
out["close"] = this.close;

        return out;
    }
    fromMixed(input: any) {
        
        this.open = input.hasOwnProperty("open") && input["open"] !== null ? input["open"] : this.open;
this.close = input.hasOwnProperty("close") && input["close"] !== null ? input["close"] : this.close;

    }
    protected _toBinary( gBuf: GrowBuffer) {
        
        gBuf.writeString(this.getClassName());
        let __arr_size = 0;
        gBuf.writeString (this.open);
gBuf.writeString (this.close);

    }
    protected _fromBinary( gBuf: GrowBuffer ) {
        
        let __arr_size = 0;
        this.open = gBuf.readString ();
this.close = gBuf.readString ();

    }
};
export class ProtocolObjectOpenProject extends Protocol {
    project_conf : ProtocolObjectProjectConfig = new ProtocolObjectProjectConfig();

    getClassName(){
        return "OpenProject"
    }
    toMixed() {
        let out: any = {};
        out["__cn"] = this.getClassName();
        out["project_conf"] = this.project_conf.toMixed();

        return out;
    }
    fromMixed(input: any) {
        
        if( input.hasOwnProperty("project_conf") && input["project_conf"] !== null && input["project_conf"] !== undefined ) {
        this.project_conf.fromMixed( input["project_conf"] );
    }

    }
    protected _toBinary( gBuf: GrowBuffer) {
        
        gBuf.writeString(this.getClassName());
        let __arr_size = 0;
        gBuf.writeUint8Array(this.project_conf.toBinary());

    }
    protected _fromBinary( gBuf: GrowBuffer ) {
        
        let __arr_size = 0;
        this.project_conf.fromBinary(gBuf.readUint8Array());

    }
};
export class ProtocolObjectCloseProject extends Protocol {
    project_conf : ProtocolObjectProjectConfig = new ProtocolObjectProjectConfig();

    getClassName(){
        return "CloseProject"
    }
    toMixed() {
        let out: any = {};
        out["__cn"] = this.getClassName();
        out["project_conf"] = this.project_conf.toMixed();

        return out;
    }
    fromMixed(input: any) {
        
        if( input.hasOwnProperty("project_conf") && input["project_conf"] !== null && input["project_conf"] !== undefined ) {
        this.project_conf.fromMixed( input["project_conf"] );
    }

    }
    protected _toBinary( gBuf: GrowBuffer) {
        
        gBuf.writeString(this.getClassName());
        let __arr_size = 0;
        gBuf.writeUint8Array(this.project_conf.toBinary());

    }
    protected _fromBinary( gBuf: GrowBuffer ) {
        
        let __arr_size = 0;
        this.project_conf.fromBinary(gBuf.readUint8Array());

    }
};
export class ProtocolObjectSelectPrefab extends Protocol {
    valid : boolean = false;prefab_conf : ProtocolObjectPrefabConfig = new ProtocolObjectPrefabConfig();ts_str : string = "";dom_str : string = "";

    getClassName(){
        return "SelectPrefab"
    }
    toMixed() {
        let out: any = {};
        out["__cn"] = this.getClassName();
        out["valid"] = this.valid;
out["prefab_conf"] = this.prefab_conf.toMixed();
out["ts_str"] = this.ts_str;
out["dom_str"] = this.dom_str;

        return out;
    }
    fromMixed(input: any) {
        
        this.valid = input.hasOwnProperty("valid") && input["valid"] !== null ? input["valid"] : this.valid;
if( input.hasOwnProperty("prefab_conf") && input["prefab_conf"] !== null && input["prefab_conf"] !== undefined ) {
        this.prefab_conf.fromMixed( input["prefab_conf"] );
    }
this.ts_str = input.hasOwnProperty("ts_str") && input["ts_str"] !== null ? input["ts_str"] : this.ts_str;
this.dom_str = input.hasOwnProperty("dom_str") && input["dom_str"] !== null ? input["dom_str"] : this.dom_str;

    }
    protected _toBinary( gBuf: GrowBuffer) {
        
        gBuf.writeString(this.getClassName());
        let __arr_size = 0;
        gBuf.writeBool (this.valid);
gBuf.writeUint8Array(this.prefab_conf.toBinary());
gBuf.writeString (this.ts_str);
gBuf.writeString (this.dom_str);

    }
    protected _fromBinary( gBuf: GrowBuffer ) {
        
        let __arr_size = 0;
        this.valid = gBuf.readBool ();
this.prefab_conf.fromBinary(gBuf.readUint8Array());
this.ts_str = gBuf.readString ();
this.dom_str = gBuf.readString ();

    }
};
export class ProtocolObjectSavePrefab extends Protocol {
    prefab_conf : ProtocolObjectPrefabConfig = new ProtocolObjectPrefabConfig();ts_str : string = "";dom_str : string = "";silent : boolean = false;

    getClassName(){
        return "SavePrefab"
    }
    toMixed() {
        let out: any = {};
        out["__cn"] = this.getClassName();
        out["prefab_conf"] = this.prefab_conf.toMixed();
out["ts_str"] = this.ts_str;
out["dom_str"] = this.dom_str;
out["silent"] = this.silent;

        return out;
    }
    fromMixed(input: any) {
        
        if( input.hasOwnProperty("prefab_conf") && input["prefab_conf"] !== null && input["prefab_conf"] !== undefined ) {
        this.prefab_conf.fromMixed( input["prefab_conf"] );
    }
this.ts_str = input.hasOwnProperty("ts_str") && input["ts_str"] !== null ? input["ts_str"] : this.ts_str;
this.dom_str = input.hasOwnProperty("dom_str") && input["dom_str"] !== null ? input["dom_str"] : this.dom_str;
this.silent = input.hasOwnProperty("silent") && input["silent"] !== null ? input["silent"] : this.silent;

    }
    protected _toBinary( gBuf: GrowBuffer) {
        
        gBuf.writeString(this.getClassName());
        let __arr_size = 0;
        gBuf.writeUint8Array(this.prefab_conf.toBinary());
gBuf.writeString (this.ts_str);
gBuf.writeString (this.dom_str);
gBuf.writeBool (this.silent);

    }
    protected _fromBinary( gBuf: GrowBuffer ) {
        
        let __arr_size = 0;
        this.prefab_conf.fromBinary(gBuf.readUint8Array());
this.ts_str = gBuf.readString ();
this.dom_str = gBuf.readString ();
this.silent = gBuf.readBool ();

    }
};
export class ProtocolObjectDeletePrefab extends Protocol {
    prefab_conf : ProtocolObjectPrefabConfig = new ProtocolObjectPrefabConfig();

    getClassName(){
        return "DeletePrefab"
    }
    toMixed() {
        let out: any = {};
        out["__cn"] = this.getClassName();
        out["prefab_conf"] = this.prefab_conf.toMixed();

        return out;
    }
    fromMixed(input: any) {
        
        if( input.hasOwnProperty("prefab_conf") && input["prefab_conf"] !== null && input["prefab_conf"] !== undefined ) {
        this.prefab_conf.fromMixed( input["prefab_conf"] );
    }

    }
    protected _toBinary( gBuf: GrowBuffer) {
        
        gBuf.writeString(this.getClassName());
        let __arr_size = 0;
        gBuf.writeUint8Array(this.prefab_conf.toBinary());

    }
    protected _fromBinary( gBuf: GrowBuffer ) {
        
        let __arr_size = 0;
        this.prefab_conf.fromBinary(gBuf.readUint8Array());

    }
};
export class ProtocolObjectFlagPrefab extends Protocol {
    prefab_conf : ProtocolObjectPrefabConfig = new ProtocolObjectPrefabConfig();

    getClassName(){
        return "FlagPrefab"
    }
    toMixed() {
        let out: any = {};
        out["__cn"] = this.getClassName();
        out["prefab_conf"] = this.prefab_conf.toMixed();

        return out;
    }
    fromMixed(input: any) {
        
        if( input.hasOwnProperty("prefab_conf") && input["prefab_conf"] !== null && input["prefab_conf"] !== undefined ) {
        this.prefab_conf.fromMixed( input["prefab_conf"] );
    }

    }
    protected _toBinary( gBuf: GrowBuffer) {
        
        gBuf.writeString(this.getClassName());
        let __arr_size = 0;
        gBuf.writeUint8Array(this.prefab_conf.toBinary());

    }
    protected _fromBinary( gBuf: GrowBuffer ) {
        
        let __arr_size = 0;
        this.prefab_conf.fromBinary(gBuf.readUint8Array());

    }
};
export class ProtocolObjectEditorConfigChange extends Protocol {
    editor_conf : ProtocolObjectEditorConfig = new ProtocolObjectEditorConfig();

    getClassName(){
        return "EditorConfigChange"
    }
    toMixed() {
        let out: any = {};
        out["__cn"] = this.getClassName();
        out["editor_conf"] = this.editor_conf.toMixed();

        return out;
    }
    fromMixed(input: any) {
        
        if( input.hasOwnProperty("editor_conf") && input["editor_conf"] !== null && input["editor_conf"] !== undefined ) {
        this.editor_conf.fromMixed( input["editor_conf"] );
    }

    }
    protected _toBinary( gBuf: GrowBuffer) {
        
        gBuf.writeString(this.getClassName());
        let __arr_size = 0;
        gBuf.writeUint8Array(this.editor_conf.toBinary());

    }
    protected _fromBinary( gBuf: GrowBuffer ) {
        
        let __arr_size = 0;
        this.editor_conf.fromBinary(gBuf.readUint8Array());

    }
};
export class ProtocolObjectEditorCacheDataConfigChange extends Protocol {
    

    getClassName(){
        return "EditorCacheDataConfigChange"
    }
    toMixed() {
        let out: any = {};
        out["__cn"] = this.getClassName();
        
        return out;
    }
    fromMixed(input: any) {
        
        
    }
    protected _toBinary( gBuf: GrowBuffer) {
        
        gBuf.writeString(this.getClassName());
        let __arr_size = 0;
        
    }
    protected _fromBinary( gBuf: GrowBuffer ) {
        
        let __arr_size = 0;
        
    }
};

//消息工厂
export class ProtocolFactory {
    static CreateFromBinary( input: Uint8Array ): Protocol{ 
        let gBuf = new GrowBuffer(input);
        let className = gBuf.readString();
        let msg = ProtocolFactory.CreateFromName(className);
        msg.fromBinary(input);
        return msg;
    }
    static CreateFromMixed(input) {
        let msg = ProtocolFactory.CreateFromName(input["__cn"]);
        msg.fromMixed(input);
        return msg;
    }
    static CreateFromName( msgName:string ): Protocol {
        if(0){
        }
        else if( msgName == "PrefabConfig") {
    return new ProtocolObjectPrefabConfig();
}else if( msgName == "ProjectConfig") {
    return new ProtocolObjectProjectConfig();
}else if( msgName == "EditorConfig") {
    return new ProtocolObjectEditorConfig();
}else if( msgName == "IPCResponse") {
    return new ProtocolObjectIPCResponse();
}else if( msgName == "WindowChange") {
    return new ProtocolObjectWindowChange();
}else if( msgName == "OpenProject") {
    return new ProtocolObjectOpenProject();
}else if( msgName == "CloseProject") {
    return new ProtocolObjectCloseProject();
}else if( msgName == "SelectPrefab") {
    return new ProtocolObjectSelectPrefab();
}else if( msgName == "SavePrefab") {
    return new ProtocolObjectSavePrefab();
}else if( msgName == "DeletePrefab") {
    return new ProtocolObjectDeletePrefab();
}else if( msgName == "FlagPrefab") {
    return new ProtocolObjectFlagPrefab();
}else if( msgName == "EditorConfigChange") {
    return new ProtocolObjectEditorConfigChange();
}else if( msgName == "EditorCacheDataConfigChange") {
    return new ProtocolObjectEditorCacheDataConfigChange();
}
        return null!;
    }
};