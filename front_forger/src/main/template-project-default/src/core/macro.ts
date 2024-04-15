var Macro = {
    APP_NAME: "{{APP_NAME}}",
    APP_VERSION: "0.2",
    APP_VERSION_TIMESTAMP: "1687504057046",
    DEBUG: 0,
    EVENTS: {
        DEBUG: "debug",
        PUSH_PAGE: "pushPage",
        PUSH_BOX: "pushBox",
        PUSH_NODE: "pushNode",

        MSG_BOX_OK: "msgBoxOk",
        MSG_BOX_YES: "msgBoxYes",
        MSG_BOX_NO: "msgBoxNo",

        USER_INFO_READY: "userInfoReady",
        USER_INFO_UPDATE: "userInfoUpdate",

        OPTION_CHANGED: "optionChanged",

        TILE_DEL: "tileDel",
        TILE_NEW: "tileNew",
        TILE_EDIT: "tileEdit"
    },
    HTTP: {
        PATH: "server",
        DOMAIN: "local.naogua.ren",
        APIS: {
            REMOTE_VERSION: "update_service/version.json",
            REMOTE_APP_VERSION: "update_service/app_version.json",
            REMOTE_BUNDLE_PATH: "update_service/Bundles",
            REQ: "req.do",
        }
    },
    LANG_TABLE: ['', 'html', 'typescript', 'javascript', 'c_cpp', 'sql', 'java',],
    ACE_THEME: [
        "ambiance",
        "chaos",
        "chrome",
        "clouds",
        "clouds_midnight",
        "cobalt",
        "crimson_editor",
        "dawn",
        "dracula",
        "dreamweaver",
        "eclipse",
        "github",
        "gob",
        "gruvbox",
        "idle_fingers",
        "iplastic",
        "katzenmilch",
        "kr_theme",
        "kuroir",
        "merbivore",
        "merbivore_soft",
        "mono_industrial",
        "monokai",
        "nord_dark",
        "pastel_on_dark",
        "solarized_dark",
        "solarized_light",
        "sqlserver",
        "terminal",
        "textmate",
        "tomorrow",
        "tomorrow_night",
        "tomorrow_night_blue",
        "tomorrow_night_bright",
        "tomorrow_night_eighties",
        "twilight",
        "vibrant_ink",
        "xcode",
    ]
};

export default Macro;