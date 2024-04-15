#include "winux.hpp"
#include "eiennet.hpp"

using namespace std;
using namespace winux;
using namespace eiennet;

// conf配置文件
Mixed ReadConfFileData(winux::String const &path)
{
    Configure conf(path);
    return conf.getAll();
}

// 2.4新的配置文件，*.settings
Mixed ReadSettingFileData(winux::String const &path)
{
    ConfigureSettings conf(path);
    Mixed mData = conf.val();

    Mixed out = $c{
        {"EnumDataConfList", $a{}},
        {"ClassDataConfList", $a{}},
    };
    Mixed &EnumDataConfList = out["EnumDataConfList"];
    Mixed &ClassDataConfList = out["ClassDataConfList"];

    Mixed &enumList = mData["enums"];
    std::vector<String> enumKeys;
    enumList.getKeys(&enumKeys);
    for (size_t i = 0; i < enumKeys.size(); i++)
    {
        String key = enumKeys[i];
        Mixed &row = enumList[key];
        row["enum"] = key;
        EnumDataConfList.add(row);
    }

    Mixed &classList = mData["classes"];
    std::vector<String> classKeys;
    classList.getKeys(&classKeys);
    for (size_t i = 0; i < classKeys.size(); i++)
    {
        String key = classKeys[i];
        Mixed &row = classList[key];
        row["class"] = key;
        ClassDataConfList.add(row);
    }

    return out;
}

// 递归获取所有配置
void GetConfigRecDir(std::string const &path, Mixed *mpAllFileData)
{
    winux::DirIterator dir(path);

    while (dir.next())
    {
        if (!dir.isDir())
        {
            String fullPath = dir.getFullPath();
            cout << "<File>" << fullPath << endl;
            if (fullPath.find(".conf") != string::npos)
            {
                mpAllFileData->add(ReadConfFileData(fullPath));
            }
            else if (fullPath.find(".settings") != string::npos)
            {
                Mixed col = ReadSettingFileData(fullPath);
                for (size_t i = 0; i < col["EnumDataConfList"].getCount(); i++)
                {
                    mpAllFileData->add(col["EnumDataConfList"][i]);
                }
                for (size_t i = 0; i < col["ClassDataConfList"].getCount(); i++)
                {
                    mpAllFileData->add(col["ClassDataConfList"][i]);
                }
            }
        }
        else
        {
            String dirName = dir.getName();
            String dirPath = dir.getPath();
            if (dirName == "." || dirName == "..")
            {
                continue;
            }

            cout << "<DIR>" << dirPath + dirName << endl;
            GetConfigRecDir(dirPath + dirName, mpAllFileData);
        }
    }
}

int main(int argc, char const *argv[])
{
    CommandLineVars cmd(argc, argv, "-i,-o,-l,--lang,-v,--version", "", "");
    if (!cmd.hasParam("--lang") && !cmd.hasParam("-l"))
    {
        cout << "require: (--lang / -l)" << endl;
        return 1;
    }
    if (!cmd.hasParam("--version") && !cmd.hasParam("-v"))
    {
        cout << "require: (--version / -v)" << endl;
        return 1;
    }

    String langTagParam = static_cast<String>(cmd.getParam("-l"));
    if (langTagParam.size() == 0)
    {
        langTagParam = static_cast<String>(cmd.getParam("--lang"));
    }
    if (langTagParam.size() == 0)
    {
        cout << "require -l or --lang" << endl;
    }
    AnsiStringArray langTags;
    StrSplit(langTagParam, ",", &langTags);

    String SRC_PATH = "./";
    String DST_PATH = "./";
    String VERSION = "";

    if (cmd.hasParam("-i"))
    {
        SRC_PATH = static_cast<String>(cmd.getParam("-i"));
    }
    if (cmd.hasParam("-o"))
    {
        DST_PATH = static_cast<String>(cmd.getParam("-o")) + "/";
    }
    if (cmd.hasParam("-v"))
    {
        VERSION = static_cast<String>(cmd.getParam("-v"));
    }
    else if (cmd.hasParam("--version"))
    {
        VERSION = static_cast<String>(cmd.getParam("--version"));
    }

    cout << cmd.getParam("-i") << endl;

    bool isDir = false;
    // 确保SRC地址
    if (winux::DetectPath(SRC_PATH, &isDir) && isDir)
    {
        // 确保DST地址
        if (!winux::DetectPath(DST_PATH, &isDir))
        {
            winux::MakeDirExists(DST_PATH);
        }
        else if (!isDir)
        {
            cout << "ERROR: " << DST_PATH << " exist!";
            return 1;
        }
    }
    Mixed mAllFileData = $a{};
    // 递归获取所有配置文件内容
    GetConfigRecDir(SRC_PATH, &mAllFileData);

    for (auto &tplName : langTags)
    {
        Mixed msg = $c{};
        msg["path"] = "actions";
        msg["action"] = "gen_by_data";
        msg["lang"] = tplName;
        msg["version"] = VERSION;
        msg["data"] = UriComponentEncode(mAllFileData.json());
        HttpCUrl http;
        http.post("https://gameptr.com/project/ggender3/server/req.do", msg);
        String res = http.getResponseStr();
        Mixed rtn;
        rtn.json(res);
        if (rtn.isNull())
        {
            cout << "error:" << res << endl;
            continue;
        }

        if ((int)rtn["ret"] == 1)
        {
            cout << "error:" << rtn["error"] << endl;
            continue;
        }
        cout << "DST_PATH: " << DST_PATH + "protocol_dist." + tplName << endl;
        FilePutContents(DST_PATH + "protocol_dist." + tplName, static_cast<String>(rtn["data"]["output_str"]));
    }
    return 0;
}