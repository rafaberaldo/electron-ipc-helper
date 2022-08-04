import { ipcMain, ipcRenderer } from 'electron'

function checkKey (key?: string) {
  if (!key || key === 'anonymous') {
    throw new Error('Key is required for anonymous methods.')
  }
}

/**
 * Create async pair.
 */
export function createIpcPair<T extends (...args: any[]) => any> (fn: T, key?: string) {
  const newKey = key ?? fn.name
  checkKey(newKey)

  const invoker = (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const response = ipcRenderer.invoke(newKey, ...args)
    response.then((data) => console.log(data)) // Debug
    return response
  }

  const handler = (...argsOuter: any[]) => {
    ipcMain.handle(newKey, (event, ...argsInner) => {
      // Todo: validate event.sender
      return fn(...argsInner, ...argsOuter)
    })
  }

  return {
    invoker,
    handler
  }
}

/**
 * Create sync pair. Only works with sync methods, should use async when possible.
 */
export function createIpcPairSync<T extends (...args: any[]) => any> (fn: T, key?: string) {
  const newKey = key ?? fn.name
  checkKey(newKey)

  const invoker = <T>((...args) => ipcRenderer.sendSync(newKey, ...args))

  const handler = (...argsOuter: any[]) => ipcMain.on(newKey, (event, ...argsInner) => {
    // Todo: validate event.sender
    event.returnValue = fn(...argsInner, ...argsOuter)
  })

  return {
    invoker,
    handler
  }
}
