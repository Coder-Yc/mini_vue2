let id = 0
/**
 * 这边主要就是定一个静态变量和几个方法
 * 调用depend时,就是去调用当前watcher上的addDep方法
 * notify就是去调用watcher里的update方法
 *
 */
class Dep {
    static target = null
      constructor() {
        this.id = id++
        this.subs = []
    }
    depend() {
        Dep.target.addDep(this)
    }
    addSub(watcher) {
        this.subs.push(watcher)
    }
    notify() {
        this.subs.forEach((watcher) => watcher.update())
    }
}

export default Dep
