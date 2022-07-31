/**
 * *用户传入的option状态处理
 * TODO 传入的props,computed,等处理
 * @param vm 传入的vue实例
 */

import { observer } from './observe/index.js'

export function initState(vm) {
    /**
     * initState是初始化状态例如(data,props,computed)
     * 如果传来的有data,那我就调用initData这个函数
     */
    const opts = vm.$options
    if (opts.data) {
        initData(vm)
    }
} 
function Proxy(vm, target, key) {
    /**
     * 对每一个key值就行代理,,当访问的时候就去实例上的target上访问
     * 例如每当访问vm.name时,就把这个key属性代理到vm._data.name上
     */
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
    /**
     * 首先判断传来的data是不是个函数,如果是,就调用这个函数
     * 把处理过后的data值放到vm实例上,能直接通过Vue实例获取到,这就是为什么在vue中能通过this.data来访问
     * 然后调用observer来处理响应式,完成之后数据就完成响应式处理了
     * 然后再代理vm上的数据,使得vm._data = vm
     * 遍历data里的数据去调用proxy方法并传过去实例,_data,key
     *
     */
    let data = vm.$options.data
    data = typeof data === 'function' ? data.call(vm) : data
    vm._data = data
    observer(data)

    for (let key in data) {
        Proxy(vm, '_data', key)
    }
}
