import Prefab from './core/prefab'
import AssetMgr from './prefabs/page_creator/asset_mgr/asset_mgr'
import CreatorMain from './prefabs/page_creator/creator_main/creator_main'
import { Selector } from './prefabs/page_creator/creator_main/selector'
import { TabView } from './prefabs/page_creator/creator_main/tab_view'
Prefab.Instantiate(AssetMgr)
Prefab.Instantiate(CreatorMain)
Prefab.Instantiate(TabView)
Prefab.Instantiate(Selector)