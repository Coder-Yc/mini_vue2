###数组的响应式处理

1. 在类里面去判断是不是数组,如果是数组就去调用类里的 `observerArray` 这个方法,专门去遍历数组,如果里面有对象,就找到里面的对象再去调用 `observe` 方法去进行观测,这一点是针对(类似于 arr = [1,2,3,{add: 123}]),这样数组中有对象的数组
2. 然后对数组的七个方法进行重写,首先拿到 Array 的原型对象,再通过 Object.create 这个方法创建出一个原型对象,导出这个对象,作用是把这个原型对象放到传来的数组对象上` data.__proto__ = newArrayProto`,这一步的作用是为了代理了数组的七个方法,同时数组中的其他方法也可以照常被使用
3. 在代理七个方法的时候,首先遍历这七个方法,使用`call`这个函数来执行原本的内容` const result = oldArrayProto[method].call(this, ...args)`这样就实现了调用内部原来的方法,重写函数对原本的函数进行劫持,接下来就是对新增的数据进行劫持,定义一个 inserted 变量,然后就对会**添加删除**red 数组值的三个方法进行 switch 处理.如果是`push`或者`unshift`就把传过来的参数给到`inserted`作为新增的数组,如果是`splice`,就使用`slice`切割
4. 拿到新增的数据之后就要想办法把新增的数据进行检测,新增的是肯定是数组,要想办法拿到 `Observe` 类上的 `observerArray`如何拿到这个实例,在这个方法里只能拿到调用者的`this`这个 this 指向的是调用的数组对象,就需要在传 data 的地方给它加上一个属性`__ob__`值就是 this,这个 this 指向的是 Observe 实例.就是这两段代码实现`data.__ob__ = this`和`ob.observerArray(inserted)`实现了新增数据的响应式
5. 上一个`data.__ob__ = this`这种写法不仅有那种用途,同时还能给对象加了一个标识,如果数据上有这个属性就说明这个属性被观测过了,在 observe 方法里加上
   ```js
   if (data.__ob__ instanceof Observer) return data.__ob__
   ```
   但是这么写有个问题,就是对象会循环引用,因为对象上会增加一个`Observer`实例方法,会调用`walk`这个方法,`walk`又去遍历对象上的属性,到那个实例方法的时候,又去调用 Observer 实例,又添加一个对象,所以要让这个属性不能被穷举到
   ```js
   Object.defineProperty(data, '__ob__', {
     enumerable: false,
     value: this
   })
   ```
