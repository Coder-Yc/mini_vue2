import { initMixin } from './init'
import { initLifecycle } from './lifecycle'
import Watcher from './observe/watch.js'
import { initGlobalApi } from './global.js'
import { initStateMixin } from './State.js'

/**
 * Vue是一个构造函数,我们可以通过原型在构造函数上添加方法
 * 把这些原型方法放到其他文件中可扩展性更强
 * 最开始初始化initMixin,给vue的原型上加上_init方法
 * new Vue的时候调用init方法去做初始化
 */

function Vue(options) {
    //options 就是传入的options api
    this._init(options)
}

initMixin(Vue)         //扩展init
initLifecycle(Vue)     //vm._update  vm._render
initGlobalApi(Vue)    //全局api
initStateMixin(Vue)   //nextTick $watch
 

export default Vue
