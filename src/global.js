import { mergeOptions } from './util/merge.js'
/**
 * 这里的合并是合并Vue静态属性上的选项,放到options
 */
export function initGlobalApi(Vue) {
  //静态方法
  Vue.options = {}
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin)
    //链式调用
    return this
  }
}
