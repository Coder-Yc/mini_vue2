/**
 * *用户传入的option状态处理
 * TODO 传入的props,computed,等处理
 * @param vm 传入的vue实例
 */

import Dep from './observe/dep.js'
import { observer } from './observe/index.js'
import Watcher, { nextTick } from './observe/watch'

export function initState(vm) {
    /**
     * initState是初始化状态例如(data,props,computed)
     * 如果传来的有data,那我就调用initData这个函数
     */
    const opts = vm.$options
    if (opts.data) {
        initData(vm)
    }
    if (opts.computed) {
        initComputed(vm)
    }
    if (opts.watch) {

        initWatch(vm)
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
     */
    let data = vm.$options.data
    data = typeof data === 'function' ? data.call(vm) : data
    vm._data = data
    observer(data)

    for (let key in data) {
        Proxy(vm, '_data', key)
    }
}

/**
 * 在这里拿到computed去遍历
 * 把当前的computed通过一个变量userDef来保存
 * 然后再拿到getter和setter,getter就是用过调用当前userDef这个函数
 * 然后将当前属性和watcher对应起来放到watchers里面
 * 这个Watcher传过去实例,需要立即执行的getter,和懒加载
 */

/**
 * computed原理q:
 * 通俗一点就是
 * 一开始merger完options,然后去拿到computed里每一个值,给每一个key值都设置一个getter,每当页面通过render时都会去调用哪个getter,
 * 当第一个进去时是脏值,然后就去调用当前watcher的evaluate计算方法,他回去调用一开始new watcher时传过去getter,然后返回一个值,再返回那个值
 * 然后判断当前的Dep全局属性有没有watcher,如果有,就要吧计算属性依赖的dep都把视图的watcher保存起来,因为计算属性watcher没有保存渲染watcher的功能
 * 所以当属性值发生变化,就去通知计算属性和渲染watcher都发生变化
 * 
 * @param {*} vm 
 */
function initComputed(vm) {
    const computed = vm.$options.computed
    const watchers = (vm._computedWatchers = {})

    for (const key in computed) {
        let userDef = computed[key]
        const getter = typeof userDef === 'function' ? userDef : userDef.get
        const setter = userDef.set || (() => {})

        //将属性和watcher对应起来

        watchers[key] = new Watcher(vm, getter, { lazy: true })

        Object.defineProperty(vm, key, {
            get: createComputedGetters(vm, key),
            set: setter
        })
    }
}
/**
 * createComputedGetters重写getter
 * 目的是为了检验值是否是脏值,首次调用是脏的,去调用watcher上面的计算方法
 * 那个计算方法会去调用默认的方法,调用默认的方法还会把当前watcher推入dep栈中
 * 同时修改dirty为false
 * 主要思路就是当前计算属性watcher已经记住两个dep,但是想要dep能更新,还需要dep记住外层的渲染watcher
 * 然后在挂载的时候访问到计算属性,就调用这个getter,就把这个计算属性里的两个dep与渲染watcher关联
 * 主要就是调用watcher.depend()这个方法让渲染watcher和计算属性的dep相互记住
 *
 * 当有依赖的属性值发生变化时,dep会调用notify去通知dep数组中装的watchers(计算属性和视图)去update
 * update里会去看是不是计算属性依赖的值,如果是就把当前计算属性改为脏值,就算是已经更新
 * 接下来要 做的就是更行视图,每次修改数据后去更新视图的时候都会去重新调用get方法,然后就去调用这个getter
 * 调用getter后就会去重新计算值
 */
function createComputedGetters(vm, key) {
    return function () {
        const watcher = vm._computedWatchers[key]
        /**
         * 这里是脏值检测,如果是脏就去计算当前计算属性watcher的值
         * evaluate会在当前watcher上挂载计算的值,同时把dirty修改为false
         */
        if (watcher.dirty) {
            watcher.evaluate()
        }
        /**
         * 这里就来把计算属性watcher里依赖的dep都与视图watcher挂钩
         * watcher是一个栈,计算属性出栈后当前全局变量就是渲染watcher,然后让dep记住渲染watcher
         */
        if (Dep.target) {
            watcher.depend()
        }
        return watcher.value
    }
}

/**
 * initState的时候就去initWatch,去处理不同情况的watcher, 字符串, array, watcher调用$watcher, 然后会去new 一个watcher并传入参数,
 * 是一个用户自定义的watcher,然后去去实例上取值触发get收集以来,然后,每当传过去的值发生变化时,都会调用watcher的run方法,里面判断是不是用户watcher,
 * 是的话就调用那个回调函数,传入新旧值
 * @param {*} vm 
 */
function initWatch(vm) {
    const watch = vm.$options.watch
    for (const key in watch) {
        /**
         * 这里判断是数组还是函数或者字符串的情况
         * 是数组就循环拿到里面的对象
         */
        const handle = watch[key] //数组  函数  字符串
        if (Array.isArray(handle)) {
            for (const h of handle) {
                createWatcher(vm, key, h)
            }
        } else {
            createWatcher(vm, key, handle)
        }
    }
}

function createWatcher(vm, key, handle) {
    /**
     * 这里处理的是watcher是字符串的情况
     * 如果是字符串就说明是
     */
    if (typeof handle === 'string') {
        handle = vm[handle]
    }
    return vm.$watch(key, handle)
}

export function initStateMixin(Vue) {
    Vue.prototype.$nextTick = nextTick
    Vue.prototype.$watch = function (expFn, cb) {
        // console.log(expFn, cb, options)
        new Watcher(this, expFn, { user: true }, cb)
    }
}
