import { initState } from './State.js'
import { compileToRenderFunction } from './compile/index'
import { mountComponent, callHooks } from './lifecycle'
import { mergeOptions } from './util/merge.js'

export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        /**
         * *{function _init}的作用是初始化options
         * 把options挂载到vm实例实例上,由于其他原型方法上也需要使用options, 所以把options挂载到实例上
         * 这里调用mergeOptions来合并全局的过滤器,指令等和用户传来的选项都挂载到Vue的实例上
         * Tip:这里的合并是Vue静态属性上的全局options和用户传来的options合并挂载到$options上
         * 然后调用initState去初始化options(data,props)的状态
         * 初始化完成之后去挂载数据
         * 判断option中没有el模版,有就直接调用$mount方法挂载
         */
        const vm = this
        vm.$options = mergeOptions(this.constructor.options, options)
        callHooks(vm, 'beforeCreated')
        initState(vm)
        callHooks(vm, 'created')
        if (options.el) {
            vm.$mount(options.el)
        }
    }

    Vue.prototype.$mount = function (el) {
        /**
         * 挂载首先拿到需要挂载的节点,然后拿到render函数
         * 然后判断是否有render函数,如果没有,判断是否有template模版有就直接拿到模版
         * 没有template就先拿到el的模版,通过模版去生成render函数,调用compileToRenderFunction方法,并挂载到renderops上
         * 拿到render函数后就调用mountComponent去生成挂载到真实dom上
         */
        let vm = this
        el = document.querySelector(el)

        // debugger
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

        mountComponent(vm, el)
    }
}
