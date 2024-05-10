import { AppNode } from "../core/app_node";
import Prefab from "../core/prefab";
import { RegClass } from "../core/serialize";
import Utils, { H5Utils } from "../core/utils";
import PageUI from "./page_ui";
@RegClass("PageHome")
export default class PageHome extends AppNode {
    onClickUI() {
        Utils.scene.replacePage(Prefab.Instantiate(PageUI))
    }
};