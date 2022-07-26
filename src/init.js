import { initState } from './State.js'
import { compileToRenderFunction } from './compile/index'
import { mountComponent } from './lifecycle'
export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    //由于其他原型方法上也需要使用options, 所以把options挂载到实例上
    const vm = this
    vm.$options = options //把用户的选项挂载到实例上
    //初始化数据状态(options)
    initState(vm)

    //数据的挂载
    if (options.el) {
      vm.$mount(options.el)
    }
  }

  Vue.prototype.$mount = function (el) {
    let vm = this
    el = document.querySelector(el)
    // console.log(el)
    let ops = vm.$options
    if (!ops.render) {
      let template
      if (ops.template) {
        template = ops.template
      } else {
        template = el.outerHTML
      }
      /**
       * 通过compileToRenderFunction拿到一个render函数并挂在到ops实例上
       */
      const render = compileToRenderFunction(template)
      ops.render = render
    }
    console.log(ops.render)

    mountComponent(vm, el)
  }
}
