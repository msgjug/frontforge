import Prefab from './core/prefab'
import AssetMgr from './prefabs/page_creator/asset_mgr/asset_mgr'
import BoxProjectSetting from './prefabs/page_creator/box_project_setting/box_project_setting'
import CreatorMain from './prefabs/page_creator/code_editor/code_editor'
import { Selector } from './prefabs/page_creator/code_editor/selector'
import { TabView } from './prefabs/page_creator/code_editor/tab_view'
import HtmlDesigner from './prefabs/page_creator/html_designer/html_designer'
Prefab.Instantiate(AssetMgr)
Prefab.Instantiate(CreatorMain)
Prefab.Instantiate(TabView)
Prefab.Instantiate(Selector)
Prefab.Instantiate(BoxProjectSetting)
Prefab.Instantiate(HtmlDesigner);