import { createElementVNode, createTextVNode } from './vdom/index'
import Watcher from './observe/watch.js'
import { patch } from './vdom/patch'

export function initLifecycle(Vue) {
    Vue.prototype._update = function (VNode) {
        /**
         * _update函数的功能是把Vnode转成真实dom
         * 里面的patch函数既有初始化的功能,又有更新的功能
         * 让patch函数有个返回值,就能把这次的最新的节点放到vm.$el,下次更新就能取到这个el
         */
        const vm = this
        const el = vm.$el
        const preVNode = vm._vnode
        vm._vnode = VNode
        // debugger
        if (preVNode) {
            vm.$el = patch(preVNode, VNode)
        } else {
            vm.$el = patch(el, VNode)
        }
    }

    /**
     * render函数中的_c,_v,_s方法
     * _c('div', {id:"app",style:{"color":"red"}},
     * _v(_s(name)+'hello'+_s(age)+'world'))
     */
    Vue.prototype._c = function (...args) {
        /**产生一个标签虚拟节点 */
        return createElementVNode(this, ...args)
    }
    Vue.prototype._v = function (...args) {
        /**
         * 产生一个文本虚拟节点
         */
        return createTextVNode(this, ...args)
    }
    Vue.prototype._s = function (value) {
        /**
         * 调用_s方法返回一个字符串value值
         */
        return JSON.stringify(value)
    }

    Vue.prototype._render = function () {
        /**
         * 通过render函数生成虚拟dom
         * 调用call为了让with中的this指向vm
         * * @return 一个由render函数产生的虚拟dom
         */
        const vm = this

        return vm.$options.render.call(vm)
    }
}

export function mountComponent(vm, el) {
    vm.$el = el
    /**
     * 相当于是每挂载一个板块或者说是组件都会去new一个watcher实例,相当于是依赖
     * 并且传过去当前组件实例,和更新渲染组件的函数
     * 剩下的事都在Watcher的类里去做
     */
    const updateComponent = () => {
        vm._update(vm._render())
    }

    new Watcher(vm, updateComponent, { lazy: false })

    /**
     * 根据虚拟dom产生真实dom
     */

    /**
     * 插入到el上
     */
}

export function callHooks(vm, hook) {
    /**
     * @param {*当前实例} vm
     * @param {*当前引用生命周期钩子} hook
     * 调用这个函数传过来当前vue实例和,生命周期钩子,去合并到options上查找这个合并的钩子,如果存在这个合并的数组就调用
     * 追忆生命周期勾子上的this值都是当前实例
     */
    // debugger
    const handles = vm.$options[hook]
    if (handles) {
        handles.forEach((handle) => handle.call(vm))
    }
}
