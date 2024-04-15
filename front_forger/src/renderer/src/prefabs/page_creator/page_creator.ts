import { AppNode, property } from "../../core/app_node";
import Prefab from "../../core/prefab";
import { RegClass } from "../../core/serialize";
import PrefabStr from "./page_creator.prefab.html?raw"
import { ScriptItem } from "./script_item";
import Utils from "../../core/utils";
import { ProtocolObjectAppConfig } from "../../protocol_dist";
import BoxProject from "../box_project/box_project";

export class CallMethod {
  method = "";
  args: any[] = [];
};

@RegClass("PageCreator")
export default class PageCreator extends AppNode {
  onLoad(): void {
    Utils.scene.addChild(Prefab.Instantiate( BoxProject));
  }
  static get PrefabStr(): string {
    return PrefabStr;
  }
};