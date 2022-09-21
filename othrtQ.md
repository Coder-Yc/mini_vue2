# keep-alive 是什么,原理是什么?

-   缓存处理

1. 拿到要缓存的组件,取到他的名字,看是否需要缓存(include,exclude),不需要直接 return
2. 然后通过组件的 key(没有就造一个 key),判断是否被缓存过
3. 如果有缓存就取出缓存的实例,然后挂载到 vnode 上后续好返回,然后使用 LRU 算法来保存节点
4. 如果没有缓存就缓存当前 vnode 和 key,最后返回 vnode

-   组件加载

1. 缓存过的组件会在 vnode 上增加一个 instance 和 keepAlive
2. 然后在组件调用 init 钩子的时候就不会去调用组件初始化以及挂载,所以它没有那些个生命周期
3. 就直接走 prepatch 这个方法,去采用上次缓存的的$el 组件实例,
4. 把新的组件插入到页面上,调用 actived 钩子
5. 然后再销毁旧的组件会调用 deavtived 钩子

# Vue 自定义指令

-   定义

1. 用户首先定义不同的钩子
2. 先在初始化的时候会挂载到全局的 options,形成一个 Vue.options.directives = {loadmore: definition},是和 component,filter 一起创建的
3. 在模板编译阶段,只需要监听虚拟 Dom 的 create,update,destory 阶段都得处理指令逻辑
4. 每一个阶段都会执行 updateDirectives 函数,它来处理指令的相关逻辑，执行指令函数,例如 bind,inserted,update,unbind 等
5. 如果没有老的指令,就调用 bind 方法,把 inserted 钩子存起来
6. 否则就是调用更新的钩子,缓存更新的钩子
7. 所谓让指令生效，其实就是在合适的时机执行定义指令时所设置的钩子函数。

```js
Vue.directive('loadmore', {
    bind(el, binding) {
        const selectWrap = el.querySelector('.el-table__body-wrapper')
        selectWrap.addEventListener('scroll', function () {
            let sign = 0
            const scrollDistance =
                this.scrollHeight - this.scrollTop - this.clientHeight
            if (scrollDistance <= sign) {
                binding.value()
            }
        })
    }
})
```

# Vue 中的事件修饰符有哪些?实现原理是什么

    主要都是依靠模版编译原理,在组成render函数的时候会去标记

-   模版编译的时候直接编译到事件内部

1. @click.prevent
2. @click.stop

-   编译的时候直接增加表示

1. @click.passive
2. @click.capture
3. @click.once

-   键盘事件

1. @keydown.left

# v-if 和 v-for 谁的优先级更高

> v-for 的优先级比 v-if 的优先级更高

-   在模版编译的时候 v-for 会变成\_l,里面调用渲染列表,根据出入的值去做不同的循环遍历不同的对象调用对应的 render 函数
-   v-if 会变成三元表达式
-   解决办法:套一层 template 或者使用计算属性去计算 v-if 的值

```js
function render() {
    with (this) {
        return _c(
            'div',
            _l(list, function (item) {
                return flag ? _c('span') : _e()
            }),
            0
        )
    }
}
```

# v-if 和 v-show 的区别

-   v-if

    1. 他在编译阶段会被变成一个三元表达式.真就直接创建当前节点,假就创建空节点
    2. 他会销毁和重建内部的事件监听.
    3. 有更高的切换消耗，不适合做频繁的切换
    4. 如果初始条件为假，则什么也不做.只有在条件第一次变为真时才开始局部编译

-   v-show 
1. 在编译阶段会变成一个指令 
2. 在运行阶段时,默认保存标签上原本的display.它会拿到传过来的 value 值和原本的 display 值.如果value是true,那就用原本的display,如果原本是none,会设置成空,如果是false那就用none 
3. 它在任何条件下都被编译，然后被缓存

    ```js
    with (this) {
        return _c('div', [
            _c('div', {
                directives: [
                    {
                        name: 'show',
                        rawName: 'v-show',
                        value: flag,
                        expression: 'flag'
                    }
                ]
            })
        ])
    }
    ```

# v-model 的实现原理

-   作用

    1. 放在表达元素上可以实现双向绑定
    2. 放在组件上

-   针对文本
    他会被编译为 value + input + directive 指令
    绑定变量 value 和 input 事件实现双向绑定阻止中文的触发,指令在运行时 inserted 时期处理中文 输入完毕手动触发更新
    ```js
    return _c('div', [
        _c('input', {
            directives: [
                {
                    name: 'model',
                    rawName: 'v-model',
                    value: msg,
                    expression: 'msg'
                }
            ],
            attrs: {
                type: 'text'
            },
            domProps: {
                value: msg
            },
            on: {
                input: function ($event) {
                    if ($event.target.composing) return
                    msg = $event.target.value
                }
            }
        })
    ])
    ```
-   针对组件
    1. 他会被编译成为一个 model 对象,组件在创建虚拟节点的时候拿到这个对象来处理
    ```js
    return _c(
        'div',
        [
            _c('my', {
                attrs: {
                    type: 'text'
                },
                model: {
                    value: msg,
                    callback: function ($$v) {
                        msg = $$v
                    },
                    expression: 'msg'
                }
            })
        ],
        1
    )
    ```
    2. 在虚拟节点处理阶段先回看一下里面是否有自定义的 prop 和 event,没有就使用 value+input
    ```js
    function transformModel(options, data: any) {
        const prop = (options.model && options.model.prop) || 'value'
        const event = (options.model && options.model.event) || 'input'
        ;(data.attrs || (data.attrs = {}))[prop] = data.model.value
        const on = data.on || (data.on = {})
        const existing = on[event]
        const callback = data.model.callback
        if (isDef(existing)) {
            if (
                Array.isArray(existing)
                    ? existing.indexOf(callback) === -1
                    : existing !== callback
            ) {
                on[event] = [callback].concat(existing)
            }
        } else {
            on[event] = callback
        }
    }
    ```

# .sync 的作用是什么

-   和 v-model 一样,这个 api 是为了实现状态同步的,在 vue3 中移除了
    绑定了 update 事件,用的时候使用@update 就好了

# Vue 中 use 的作用,原理是什么

-   两种写法

    ```js
    let plugin = {
        install: function (Vue, options) {
            console.log(Vue, options)
        }
    }
    Vue.use(plugin, { a: 1, b: 2 })
    ```

    ```js
    let plugin = function (Vue, options) {
        console.log(Vue, options)
    }

    Vue.use(plugin, { a: 1, b: 2 })
    ```

-   原因
    使用 use 的原因就是就是把 vue 的构造函数传给插件, 让插件中的 vue 版本都统一

-   原理
    内部拿到这个插件做一个缓存避免重复运行,然后拿到函数或者 install 函数去 apply 执行

# 组件中写 name 的好处是什么

-   在 vue 中有 name 属性的组件可以被递归调用,可以调用自身
-   用 name 来标识组件,通过 name 来找到组件,自己可以封装跨级组件
    ```js
    Vue.prototype.$dispatch = function (name, data, fn) {
        let vm = this
        while(vm) {
            if(vm.$options.name = name) {
                vm[fn].apply(this, data)
            }
            vm = vm.$parent
        }
    }
    //my1
    mounted() {
        this.$dispatch('my3', {a:1}, handle)
    }
    //my3
    methods: {
        handle(data) {
            console.log(data.a);
        }
    }
    ```
-   可以用作 devtool 的调试工具

# vue-router 的实现原理

###### 调用插件的 install 方法

1.  首先会使用 Vue.mixin 以及给$router和$route 加上一个 get,用户能在 Vue 实例上直接取到当前\_router 和\_route
2.  去注册两个组件 RouterView 和 RouterLink
3.  执行 Vue 的 mixin 在里面混入 beforeCreate 和 destroyed 方法
    -   保存了当前组件实例和用户配置的路由表
    -   调用 ue.util.defineReactive 给当前组件添加上\_route 属性(响应式)值是当前路由
    -   执行 init 方法去做初始化

###### VueRouter 类里的内容以及 init 初始化

1.  constrctor 中做的初始化.首先确定 mode 类型从而去 new 出对应类型的 history 实例.同时,通过用户写的路由表去创建一个 Matcher

    -   Matcher 返回两个方法,match 负责匹配找出路由对应的组件,addRoutes 负责把用户添加的路由添加

    -   内部会创建路由映射表,包括三个部分.pathList 存储所有的 path，pathMap 表示一个 path 到 RouteRecord 的映射关系，而 nameMap 表示 name 到 RouteRecord 的映射关系,里面都是 RouteRecord 类型(一个完整的树形结构,包括父亲儿子的路由)

    -   match 方法会根据传进来的路由匹配返回出一个 route(有规定的数据结构,除了 url,name,path 这些,还有 matched 表示已经匹配的路由,包括父亲和自己)
    -   addRoutes 负责把用户添加的路由添加就是把传来的路由表和原来的做一个合并

2.  init 中的初始化.调用 history 上的 transitionTo 方法去做跳转,那里会去匹配路由
    -   首先通过当前 location 去匹配到 route
    -   然后调用 confirmTransition.执行一系列钩子
    -   他是维护了一个队列,队列里每一个值都是一个个函数,都会先去匹配出需要运行的钩子和用户写的钩子
        通过自己维护的执行器来一个个执行

-   最后执行 confirmTransition 成功的回调,调用 init 时 listen 中的函数,修改 app(当前组件)的\_route 值,触发 setter,从而使组件重新渲染,最后执行 afterEach 钩子
-   最后执行 transitionTo 的回调调用不同模式下的监听器.hash 模式会判断支不支持 popState,不是就用 hashChange,history 就是 popState.如果触发就去调用 transitionTo 来更新组件

###### RouterView 和 RouterLink 组件

1.  RouterView 组件是一个 functional 组件它的渲染也是依赖 render 函数

    -   拿到路由的 matched(父亲和自己的路由),这里使用 parent.$route,所以\_route 就收集依赖了
    -   然后使用 while 循环一直往上找,找到所有的 router-view 组件,用 depth 保存起来
    -   然后根据 depth 拿到组件的实例
    -   最后根据 component 渲染出对应的组件 vonde
    -   更新的时候就是执行完 transitionTo 后修改\_route 又触发了 setter,因此会通知 router-view 的渲染 watcher 更新重新渲染组件。

2.  RouterLink 在点击导航时,通过 to 属性指定目标地址,默认渲染成带有正确链接的 a 标签,可以通过配置 tag 属性生成别的标签
    -   它会监听点击事件执行 hanlder 函数,最终执行 router.push 或者 router.replace 函数

###### HashHistory 和 HTML5History 模式

1.  HashHistory 针对于不支持 history api 的降级处理，以及保证默认进入的时候对应的 hash 值是以 / 开头的

    -   在支持 pushState 的情况下会调用 pushState、replaceState，而不支持时则会回退到直接修改 hash。

2.  HTML5History 使用了新的 history api 来更新

3.  AbstractHistory 所做的仅仅是用一个数组当做栈来模拟浏览器历史记录，拿一个变量来标示当前处于哪个位置。
