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
    Vue.component = function (id, definition) {
    
        definition =
            typeof definition === 'function'
                ? definition
                : Vue.extend(definition)
        Vue.options.component[id] = definition
    }
}
