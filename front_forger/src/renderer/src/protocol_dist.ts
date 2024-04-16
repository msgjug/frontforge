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
    app_name : string = "";app_version : string = "";path : string = "";prefabs_list : ProtocolObjectPrefabConfig [] = [];

    getClassName(){
        return "ProjectConfig"
    }
    toMixed() {
        let out: any = {};
        out["__cn"] = this.getClassName();
        out["app_name"] = this.app_name;
out["app_version"] = this.app_version;
out["path"] = this.path;
out["prefabs_list"] = [];
this.prefabs_list.forEach(ele => {
    out["prefabs_list"].push(ele.toMixed());
});

        return out;
    }
    fromMixed(input: any) {
        
        this.app_name = input.hasOwnProperty("app_name") && input["app_name"] !== null ? input["app_name"] : this.app_name;
this.app_version = input.hasOwnProperty("app_version") && input["app_version"] !== null ? input["app_version"] : this.app_version;
this.path = input.hasOwnProperty("path") && input["path"] !== null ? input["path"] : this.path;
{
    let arr: any[] = input.hasOwnProperty("prefabs_list") && input["prefabs_list"] !== null ? input["prefabs_list"] : [];
    let count = arr.length;
    for (let i = 0; i < count; i++) {
        let ele = new ProtocolObjectPrefabConfig();
    ele.fromMixed( arr[i] );
    this.prefabs_list.push( ele );
    }
}

    }
    protected _toBinary( gBuf: GrowBuffer) {
        
        gBuf.writeString(this.getClassName());
        let __arr_size = 0;
        gBuf.writeString (this.app_name);
gBuf.writeString (this.app_version);
gBuf.writeString (this.path);
__arr_size = this.prefabs_list.length;
gBuf.writeUint32(__arr_size);
for (let i = 0; i < __arr_size; i++) {
    gBuf.writeUint8Array(this.prefabs_list[i].toBinary());
}

    }
    protected _fromBinary( gBuf: GrowBuffer ) {
        
        let __arr_size = 0;
        this.app_name = gBuf.readString ();
this.app_version = gBuf.readString ();
this.path = gBuf.readString ();
__arr_size = gBuf.readUint32();
for (let i = 0; i < __arr_size; i++) {
    let ele = new ProtocolObjectPrefabConfig();
ele.fromBinary(gBuf.readUint8Array());
this.prefabs_list.push(ele);
}

    }
};
export class ProtocolObjectEditorConfig extends Protocol {
    project_configs : ProtocolObjectProjectConfig [] = [];

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

    }
    protected _toBinary( gBuf: GrowBuffer) {
        
        gBuf.writeString(this.getClassName());
        let __arr_size = 0;
        __arr_size = this.project_configs.length;
gBuf.writeUint32(__arr_size);
for (let i = 0; i < __arr_size; i++) {
    gBuf.writeUint8Array(this.project_configs[i].toBinary());
}

    }
    protected _fromBinary( gBuf: GrowBuffer ) {
        
        let __arr_size = 0;
        __arr_size = gBuf.readUint32();
for (let i = 0; i < __arr_size; i++) {
    let ele = new ProtocolObjectProjectConfig();
ele.fromBinary(gBuf.readUint8Array());
this.project_configs.push(ele);
}

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
}
        return null!;
    }
};