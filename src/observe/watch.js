import Dep from './dep'
import { pushTarget, popTarget } from './dep'
let id = 0
/**
 * 不同组件有不同的watcher
 * watcher看成是观察者,属性dep就看作是被观察者
 * 首先创建一个id,作为每一个组件watcher的唯一标识
 * 把传过来的更新组件函数保存起来,因为后面可能需要去取值
 * 然后把deps用个数组保存起来,depsID用set保存
 * 然后立马去调用get函数,在get函数里面去把当前watcher赋值给Dep的静态属性,这样就能在全局任何一个地方通过Dep.target拿到当前watcher
 * 然后去调用getter保存的函数,去触发识图更新
 * 在触发的过程调用render函数,render函数就会去取那些属性的值,就会触发属性的get,接着去看defineReactive这个函数
 */
class Watcher {
    constructor(vm, expFn, options, cb) {
        this.id = id++
        this.getter =
            typeof expFn === 'string'
                ? function () {
                      return vm[expFn]
                  }
                : expFn
        this.deps = []
        this.depsId = new Set()
        // debugger
        this.cb = cb
        this.lazy = options.lazy
        this.dirty = this.lazy
        this.vm = vm
        this.user = options.user
        this.value = this.lazy ? undefined : this.get()
    }
    get() {
        pushTarget(this)
        let value = this.getter.call(this.vm)
        popTarget()
        return value
    }
    depend() {
        let i = this.deps.length
        while (i--) {
            this.deps[i].depend() //让计算属性watcher收集渲染watcher
        }
    }
    evaluate() {
        this.value = this.get()
        this.dirty = !this.dirty
    }
    /**
     * @param {*} dep 传过来的当前dep
     * 这边判断depsId里有没有那个id 如果有就不添加了,
     */
    addDep(dep) {
        let id = dep.id
        if (!this.depsId.has(id)) {
            this.deps.push(dep)
            this.depsId.add(id)
            dep.addSub(this)
        }
    }
    update() {
        /**
         * 如果是计算属性,依赖的值变化了,就标识计算属性是脏值了
         */
        if (this.lazy) {
            this.dirty = true
        } else {
            queueWatcher(this)
        }
    }
    run() {
        let oldVal = this.value
        let newVal = this.get()
        if (this.user) {
            this.cb.call(this.vm,  newVal, oldVal)
        }
    }
}
export default Watcher

/**
 * 这一点是针对有很多的修改同一属性值
 * 当触发更新的时候会调用每一个watcher里的update方法
 * 然后会调用queueWatcher函数,首先判断传过来的watcher的id存不存在has里面
 * 如果没有,就把这个watcher加入到队列里面,然后判断pending值是true还是false,这个属性作用是用来做防抖
 * 第一次进来的时候就是false,所以能加载setTimeout,把flushScheduleQueue这个函数加入到宏任务队列,
 * 在执行刷新操作的时候,先将pending设为false, queue置空,这样就能让任务在执行的过程中,如果有任务过来,还能继续添加到队列中
 * 等执行的时候就拿出queue里面的watcher来执行
 */

let queue = []
let has = {}
let pending = false
//刷新操作
function flushScheduleQueue() {
    let flushQueue = queue.slice(0)
    queue = []
    has = {}
    pending = false
    for (let i = 0; i < flushQueue.length; i++) {
        flushQueue[i].run()
    }
}

function queueWatcher(watcher) {
    /**
     * 如果相同的watcher进来,id保存起来了,就不会执行!has[id]这个里面的东西
     * 但是这个时候它的值已经修改了
     */
    const id = watcher.id
    if (!has[id]) {
        queue.push(watcher)
        has[id] = true
        if (!pending) {
            nextTick(flushScheduleQueue, 0)
            pending = true
        }
    }
}
/**
 * 导出去之后就能挂载到在vue的实例上
 * 这样,用户调用nextTick和内部调用的nextTick都是同一个
 * 至于优先级就是看修改的操作和调用的实例的nextTick谁在前面
 *
 */
let callbacks = []
let waiting = false
function flushCallBacks() {
    let cbs = callbacks.slice(0)
    waiting = false
    callbacks = []
    cbs.forEach((cb) => cb())
}

/**
 * 优雅降级的方案
 */
let timeFunc
if (Promise) {
    timeFunc = () => {
        Promise.resolve().then(flushCallBacks)
    }
} else if (MutationObserve) {
    const observer = new MutationObserver(flushCallBacks)
    const textNode = document.createTextNode(1)
    observer.observe(textNode, {
        characterData: true
    })
    timeFunc = () => {
        textNode.textContent = 2
    }
} else if (setImmediate) {
    timeFunc = () => {
        setImmediate(flushCallBacks)
    }
} else {
    setTimeout(flushCallBacks)
}

/**
 * 这一点是针对同步修改获取不到更新后的值的方案
 * 用户开了多个nextTick,这些nextTick就会在这个callbacks数组里保存起来
 * 这边就相当于是把函数修改和nextTick的回调函数放到一起,任务结束之后就去执行毁掉函数的东西
 * 只有第一个nextTick或者修改操作才会触发setTimeout里面的函数,等callbacks里面装满了就去调用
 * 这些就是vue核心逻辑,异步函数批处理
 * nextTick不是创建一个异步任务,而是把这个任务维护到了队列当中,至于内部怎么去处理这个队列,就开个异步的任务
 * 内部没有采用某个api例如settimeout,而是采用优雅降级的方式
 * 内部首先使用promise(ie不兼容),MutationObserve,setImmediate,setTimeout
 */
export function nextTick(cb, delay) {
    callbacks.push(cb)
    if (!waiting) {
        timeFunc()
        waiting = true
    }
}
