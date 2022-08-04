/**
 * Author: Rafael Beraldo <@rafaelpimpa>
 * https://github.com/rafaelpimpa/electron-ipc-helper
 */

import { ipcMain, ipcRenderer } from 'electron'

function validateKey (key?: string) {
  if (!key || key === 'anonymous') {
    throw new Error('Key is required for anonymous methods.')
  }
}

/**
 * Create async pair.
 * @param fn the method/function
 * @param key optional for named functions, required for anonymous
 * @returns object { invoker, handler }
 */
export function createIpcPair<T extends (...args: any[]) => any> (fn: T, key?: string) {
  const newKey = key ?? fn.name
  validateKey(newKey)

  const invoker = (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return ipcRenderer.invoke(newKey, ...args)
  }

  const handler = (...argsMain: any[]) => {
    ipcMain.handle(newKey, (event, ...argsRenderer) => {
      // Todo: validate sender
      return fn(...argsRenderer, ...argsMain)
    })
  }

  return {
    invoker,
    handler
  }
}

/**
 * Create sync pair. Only works with sync methods, should use async when possible.
 * @param fn the method/function
 * @param key optional for named functions, required for anonymous
 * @returns object { invoker, handler }
 */
export function createIpcPairSync<T extends (...args: any[]) => any> (fn: T, key?: string) {
  const newKey = key ?? fn.name
  validateKey(newKey)

  const invoker = <T>((...args) => ipcRenderer.sendSync(newKey, ...args))

  const handler = (...argsMain: any[]) => ipcMain.on(newKey, (event, ...argsRenderer) => {
    // Todo: validate sender
    event.returnValue = fn(...argsRenderer, ...argsMain)
  })

  return {
    invoker,
    handler
  }
}
