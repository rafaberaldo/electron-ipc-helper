# electron-ipc-helper

Typesafe IPC helper/wrapper for Electron

## Installation

Copy the ``ipc.ts`` file to your helpers, add your sender validation.
Maybe I'll add a package in the future.

## Usage

* For async (recommended) use ``createIpcPair``.
* For sync use ``createIpcPairSync``.

```ts
// sayHi.ts
import { createIpcPair } from 'ipc'

function _sayHi (fromRenderer: string, fromMain: string) {
  console.log(`hi from ${fromRenderer}`)
  return `hi from ${fromMain}`
}

// First param is the function, second is the key
// The key is optional for named functions, and required for anonymous
const { invoker, handler } = createIpcPair(_sayHi)
export const sayHi = invoker
export const onSayHi = handler
```

```ts
// preload.ts
import { contextBridge } from 'electron'
import { sayHi } from 'sayHi'

declare global {
  interface Window {
    sayHi: typeof sayHi
  }
}

contextBridge.exposeInMainWorld('sayHi', sayHi)
```

```ts
// main.ts
import { onSayHi } from 'sayHi'

// parameters here will be set after the renderer parameters
onSayHi('main process')
```

```ts
// renderer.ts / index.html
// prints 'hi from renderer process' in node console
// prints 'hi from main process' in browser console/devtools
window.sayHi('renderer process').then((msg) => console.log(msg))
```

Fully typed:

![](https://user-images.githubusercontent.com/18370605/182873012-0a13b94c-d260-47bf-a5b3-f0e63592e17d.png)
