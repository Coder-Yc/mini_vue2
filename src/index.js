import { initMixin } from './init'
import { initLifecycle } from './lifecycle'
import { nextTick } from './observe/watch.js'

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
Vue.prototype.$nextTick = nextTick

initMixin(Vue)
initLifecycle(Vue)
export default Vue
