/**
 * *用户传入的option状态处理
 * TODO 传入的props,computed,等处理
 * @param vm 传入的vue实例
 */

import { observer } from './observe/index.js'

export function initState(vm) {
  const opts = vm.$options
  if (opts.data) {
    initData(vm)
  }
}
function Proxy(vm, target, key) {
  //例如每当访问vm.name时,就把这个key属性代理到vm._data.name上
  Object.defineProperty(vm, key, {
    get() {
      return vm[target][key]
    },
    set(newValue) {
      vm[target][key] = newValue
    }
  })
}

function initData(vm) {
  let data = vm.$options.data
  data = typeof data === 'function' ? data.call(vm) : data
  // console.log(data)
  //把data值放上到vm实例上,能直接获取到
  vm._data = data
  //处理数据响应式
  observer(data)

  //代理vm上数据,使得vm._data = vm
  for (let key in data) {
    Proxy(vm, '_data', key)
  }
}
