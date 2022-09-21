import { mergeOptions } from './util/merge.js'
/**
 * 这里的合并是合并Vue静态属性上的选项,放到options
 */
export function initGlobalApi(Vue) {
    //静态方法
    Vue.options = {
        _base: Vue
    }
    Vue.mixin = function (mixin) {
        this.options = mergeOptions(this.options, mixin)
        //链式调用
        return this
    }

    /**
     * 可以手动创造组件进行挂载
     */
    Vue.extend = function (options) {
        //根据用户的参数返回一个构造函数
        function Sub(options = {}) {
            //最终使用一个组件 就是去new一个实例
            this._init(options)
        }

        Sub.prototype = Object.create(Vue.prototype)
        Sub.prototype.constructor = Sub
        Sub.options = mergeOptions(Vue.options, options)
        return Sub
    }
    Vue.options.component = {} //全局的指令 Vue.options.directives

    /**
     * Q: 组件的挂载流程
     * @param {*} id 
     * @param {*} definition 
     * 组件的挂载分为两部分
     * 第一部分: 内部会调用一个extend方法创建一个组件的构造函数,同时我们可以通过api来直接调用这个extend,这里面也会去调用——init方法等然后手动调用mount方法进行挂载
     * 然后拿到这个构造函数后把它直接挂载到Vue的options上面,这样就能在别的地方访问到
     * 第二部分: 当去调用render的时候 去生成虚拟节点的时候 如果不是正常的标签,就通过刚刚的构造函数创建组件虚拟节点,
     * 在节点上定一个钩子, 一会调用这个钩子来挂载组件
     * 然后在patch的时候,创建真实节点,调用这个钩子,通过上一步返回的实例,去调用$mount然后去解析挂载最后会返回一个真实节点
     */
    Vue.component = function (id, definition) {
    
        definition =
            typeof definition === 'function'
                ? definition
                : Vue.extend(definition)
        Vue.options.component[id] = definition
    }
}
