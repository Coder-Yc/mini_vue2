# mini_vue2

这是一个仿 vue2 源码所做的 mini_vue2,实现方式和思路基本和 vue2 源码一样,代码中每一个函数都写有注释,能帮助更好的理解 vue2 中的方法实现,如有写的不好的地方,欢迎指出 👏

## 已经实现的功能(不断更新)

-   webpack 搭建环境

-   对象响应式原理实现

-   数组的函数劫持

-   通过正则解析 html 模版

-   通过解析的字符转成 AST 树

-   利用 ast 树转成 render 函数

-   通过 render 函数生成虚拟 dom

-   通过虚拟 dom 替换到到真实 dom 上

-   实现 Vue 中的依赖收集

-   实现异步更新方法,nextTick 方法

-   实现 mixin 方法和生命周期功能

## 使用方法

### 下载文件

首先`git clone`或者`download zip`包下来代码

```
git clone git@github.com:Coder-Yc/mini_vue2.git
```

### 安装依赖

```
npm install
```

### 编译并且热更新模版

```
npm run dev
```

### 编译打包并且运行文件(没有热更新)

```
npm run serve
```

### 统一文件样式(可忽略)

```
npm run prettier
```

### 使用 mini_vue2

在`index2.html`中修改 data 值,任何你在 vue2 中能使用的方式都能实现(还未开发完全的功能除外),模版解析与响应式和异步更新已经完成好例如下面例子

```js
<body>
    <div id="app" style="color: red; background-color: pink;">
        {{age}} {{name}} {{age}}
    </div>
</body>
<script>
    const vm = new Vue({
        data() {
            return {
                name: 'qwe',
                age: 21,
                address: ['123', '456'],
            }
        },
        el: '#app',
    })

    vm.age = 899
    vm.$nextTick(() => {
        console.log('age的值是', app.innerHTML);
    })
</script>

```
