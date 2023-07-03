import { AppNode, property } from "../../core/app_node";
import { RegClass } from "../../core/serialize";
import PrefabStr from './frame_foot.prefab.html?raw'
@RegClass("FrameFoot")
export default class FrameFoot extends AppNode {
    static get PrefabStr(){
        return PrefabStr;
    }
};