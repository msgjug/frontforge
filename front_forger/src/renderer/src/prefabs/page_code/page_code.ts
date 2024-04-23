import { Protocol, ProtocolObjectCloseProject } from "../../../../classes/protocol_dist";
import { AppNode } from "../../core/app_node";
import { RegClass } from "../../core/serialize";
import EditorEnv from "../../env";
import CreatorMain from "../page_creator/creator_main/creator_main";
import PrefabStr from "./page_code.prefab.html?raw";
@RegClass("PageCode")
export default class PageCode extends AppNode {
    creatorMain: CreatorMain = null;

    onDispose(): void {
            EditorEnv.offMessage(this);
    }
    onLoad(): void {
        EditorEnv.onMessage( this.onMessage, this );
    }
    onMessage( msg: Protocol ){
        switch( true ) {
            case msg instanceof ProtocolObjectCloseProject:
                window.close();
                break;
        }
    }

    static get PrefabStr(): string {
        return PrefabStr;
    }
};