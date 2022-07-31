/**
 * *重写数组原型中的方法
 * 首先拿到 Array 的原型对象,再通过 Object.create 这个方法创建出一个原型对象,导出这个对象
 * 然后代理七个方法的时候,首先遍历这七个方法,使用`call`这个函数来执行原本的内容
 * 这样就实现了调用内部原来的方法,重写函数对原本的函数进行劫持
 * 接下来就是对新增的数据进行劫持,定义一个 inserted 变量
 * 然后就对会 添加删除 数组值的三个方法进行 switch 处理
 * 如果是`push`或者`unshift`就把传过来的参数给到`inserted`作为新增的数组,如果是`splice`,就使用`slice`切割
 * 拿到新增的数据之后就要想办法把新增的数据进行检测,新增的是肯定是数组
 * 要想办法拿到 `Observe` 类上的 `observerArray`
 * 在这个方法里只能拿到调用者的`this`这个 this 指向的是调用的数组对象,
 * 就需要在传 data 的地方给它加上一个属性`__ob__`值就是 this,这个 this 指向的是 Observe 实例
 * 这样就能拿到Observer类上的方法了
 */


let oldArrayProto = Array.prototype
export let newArrayProto = Object.create(oldArrayProto)

const methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'reserve', 'sort']

methods.forEach((method) => {
    //arr.push(1,2,3)
    newArrayProto[method] = function (...args) {
        //调用内部原来的方法,重写函数对原本的函数进行劫持
        const result = oldArrayProto[method].call(this, ...args)
        console.log('代理的method', method)
        //对新增的数据进行劫持处理
        let inserted
        let ob = this.__ob__
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args
                break
            case 'splice':
                inserted = args.slice(2)
        }
        console.log(inserted) //新增的内容
        // debugger
        if (inserted) {
            ob.observerArray(inserted)
        }
        ob.dep.notify()
        return result
    }
})
