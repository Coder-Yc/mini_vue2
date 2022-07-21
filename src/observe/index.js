/**
 *
 * @param {传过来的数据进行劫持} data
 * @returns
 */

import { newArrayProto } from './array'
class Observer {
  constructor(data) {
    //给这个data添加一个属性this指向Observer
    //同时给对象加了一个标识,如果数据上有这个属性就说明这个属性被观测过了
    console.log(data)
    Object.defineProperty(data, '__ob__', {
      enumerable: false,
      value: this
    })
    // console.log(data)
    // data.__ob__ = this
    //重写数组中的方法,可以修改数组本身的方法
    if (Array.isArray(data)) {
      data.__proto__ = newArrayProto
      this.observerArray(data) // 如果数组中放的是对象,这样就可以监听到
    } else {
      this.walk(data)
    }
  }
  //循环对象,对属性依次遍历
  walk(data) {
    //重新定义属性,性能很差
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]))
  }
  //循环数组里,找到数组中的对象,进行观测
  observerArray(data) {
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
      console.log('获取到代理的值', value)
      return value
    },
    set(newValue) {
      //修改值的时候会触发set
      console.log('设置到代理的值', newValue)
      //对于传过来的如果是对象要再进行代理
      observer(newValue)
      value = newValue === value ? value : newValue
    }
  })
}

export function observer(data) {
  //对对象进行劫持
  console.log(typeof data)
  if (typeof data !== 'object' || data === null) return
  if (data.__ob__ instanceof Observer) return data.__ob__
  //如果一个对象属性被劫持过了,那就不需要再被劫持了
  return new Observer(data)
}
