/**
 *
 * @param {传过来的数据进行劫持} data
 * @returns
 */
class Observer {
  constructor(data) {
    this.walk(data)
  }
  //循环对象,对属性依次遍历
  walk(data) {
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]))
  }
}

function defineReactive(target, key, value) {
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
      value = newValue === value ? value : newValue
    }
  })
}

export function observer(data) {
  //对对象进行劫持
  //   console.log(data)
  if (typeof data !== 'object' && data === null) return

  return new Observer(data)
}
