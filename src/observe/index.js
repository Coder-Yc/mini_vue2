/**
 * @param {传过来的数据进行劫持} data
 * @returns
 */
import { newArrayProto } from './array'
import Dep from './dep'
class Observer {
  constructor(data) {
    /**
     * 给这个data添加一个属性this指向Observer
     * 同时给对象加了一个标识,如果数据上有这个属性就说明这个属性被观测过了
     */
    Object.defineProperty(data, '__ob__', {
      enumerable: false,
      value: this
    })

    /**
     * 判断是不是数组
     * 如果不是数组,就调用walk去对对象观测
     * 如果是数组首先就去重写数组中的方法,可以修改数组本身的方法通过拿到新的proto的值给data数组中的原型
     * 其次去调用类里的 `obserevrArray` 这个方法检测是否数组中有对象
     * 这一点是针对(类似于 `arr = [1,2,3,{add: 123}])`
     */
    if (Array.isArray(data)) {
      data.__proto__ = newArrayProto
      this.observerArray(data) // 如果数组中放的是对象,这样就可以监听到
    } else {
      this.walk(data)
    }
  }

  walk(data) {
    /**
     * *walk这个方法就是对对象就行遍历的
     * *循环对象,对属性依次遍历,对拿到的key都去调用defineReactive方法,来实现劫持
     * @param {*传过来的data数据} data
     */
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]))
  }
  observerArray(data) {
    /**
     * 循环数组里,如果找到数组中的对象,调用observer进行观测
     */
    data.forEach((item) => {
      observer(item)
    })
  }
}

function defineReactive(target, key, value) {
  /**
   * 这里的value相当于是一个闭包,在这个闭包内,get和set处理的值都是value
   * observer对所有的对象都进行劫持,如果value是对象,调用observe
   * 然后new一个Dep实例,每一个属性都有一个dep实例,相当于是每一个属性都有一个dep
   */
  observer(value)
  let dep = new Dep()
  Object.defineProperty(target, key, {
    /**
     *当来取属性的时候就会判断Dep上有没有targe这个属性,相当于是刚刚在new Watcher的时候把watcher挂载到Dep.target上了
     * 然后通过defineProperty对属性就行劫持
     * 首先判断Dep.target有没有值,如果有就调用dep的depend方法,在这个方法里调用Dep.target也就是当前watcher上的addDep方法把当前dep添加到watcher维护的数组里
     * 在那边又会调用当前dep的addSub方法,把这个watcher添加到dep维护的subs数组中,这样就是相互保存了
     */
    get() {
      //取值的时候会执行get
      if (Dep.target) {
        dep.depend()
      }
      // debugger
      return value
    },
    /**
     * 修改值的时候会触发set,对于传过来的如果是对象要再进行代理
     * 然后出发dep上的notify去通知更新
     * notify再去通知subs里的watcher去调用update方法
     */
    set(newValue) {
      console.log('劫持了修改后的值', newValue)
      observer(newValue)
      value = newValue === value ? value : newValue
      dep.notify()
    }
  })
}

export function observer(data) {
  /**
   * 首先判断传过来的data是对象还是数组,对象就用object.definePrototype,数组就重写方法
   * 判断如果一个对象属性被劫持过了,那就不需要再被劫持了
   */
  if (typeof data !== 'object' || data === null) return
  if (data.__ob__ instanceof Observer) return data.__ob__
  return new Observer(data)
}
