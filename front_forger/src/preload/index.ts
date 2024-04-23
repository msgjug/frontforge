import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
const { ipcRenderer } = require('electron')

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

ipcRenderer.on('port', async e => {
  console.log("port", e);
  if (process.contextIsolated) {
    window.postMessage('port', '*', e.ports)
    console.log("contextIsolated", e.ports);
  } else {
    // 接收到端口，使其全局可用。
    // @ts-ignore (define in dts)
    window.msgPort = e.ports[0];
    // @ts-ignore (define in dts)
    console.log("windowed", window.msgPort);
  }
})