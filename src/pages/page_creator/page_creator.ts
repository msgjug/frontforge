import { AppNode, property } from "../../core/app_node";
import { RegClass } from "../../core/serialize";
import PrefabStr from "./page_creator.prefab.html?raw"

@RegClass("PageCreator")
export default class PageCreator extends AppNode {
  // @property( )
  static get PrefabStr(): string {
    return PrefabStr;
  }
};