import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
const { ipcRenderer } = require('electron')

//将接口准备给renderer。
// if(process.contextIsolated) {
  //   contextBridge.exposeInMainWorld('apiName', api)
  // } 
  // else {
  //   window["apiName"] = api
  // }

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
}