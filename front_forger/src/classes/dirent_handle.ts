// 文件类
export class DirentHandle {
    isDir = false;
    path = "";
    name = "";

    //isDir==false
    extName = "";
    // buffer: Buffer = null!;
    dataStr = "";

    //isDir==true
    children: DirentHandle[] = [];
};