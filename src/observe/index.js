/**
 * @param {传过来的数据进行劫持} data
 * @returns
 */
import { newArrayProto } from './array'

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
  //这里的value相当于是一个闭包,在这个闭包内,get和set处理的值都是value
  observer(value) //对所有的对象都进行劫持,如果value是对象,调用observe,里面有判断了
  Object.defineProperty(target, key, {
    get() {
      //取值的时候会执行get
      return value
    },
    set(newValue) {
      //修改值的时候会触发set
      //对于传过来的如果是对象要再进行代理
      observer(newValue)
      value = newValue === value ? value : newValue
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
