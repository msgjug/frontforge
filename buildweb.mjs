import fs from 'fs'

let dir = fs.opendirSync("./dist/assets");

let dirent = dir.readSync();
while (dirent) {
  if (dirent.isFile()) {
    if (dirent.name.match("index") && dirent.name.match(".js")) {
      let buf = fs.readFileSync("./dist/assets/" + dirent.name);
      let text = buf.toString();
      console.log(dirent.name, text.substring(0, 100));
      text = text.replace("DEBUG:1,", "DEBUG:0,");
      text = text.replace(`DOMAIN:"local.naogua.ren"`, `DOMAIN:"naogua.ren"`);
      fs.writeFileSync("./dist/assets/" + dirent.name, text);
    }
  }
  dirent = dir.readSync();
}

dir.closeSync();