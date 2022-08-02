/**
 * mixin合并策略
 * 先循环父级的对象,遍历里面的键值对,去调用mergeFile这个方法
 * mergeFile的策略就是首先拿儿子里的key值,,如果没有就用父亲里的
 * 至于如何把它存储成['created': []]这样的形式就需要采取策略模式stratas
 */

//合并练习策略
const stratas = {}
const LIFECYCLE = ['beforeCreated', 'created', 'beforeMounted', 'mounted']
LIFECYCLE.forEach((hook) => {
    stratas[hook] = function (p, c) {
        /**
         * {} {created: function() {}}    =>    {created:[fn]}
         * {created: [fn]} {created: function() {}}   =>    {created: [fn,fn]}
         */
        if (c) {
            if (p) {
                return p.concat(c)
            } else {
                return [c]
            }
        } else {
            return p
        }
    }
})

stratas.components = function (parent, child) {
    /**
     * 返回的是构造函数的对象,可以拿到父亲原型上的属性,并把儿子都拷贝到自己的身上
     */
    const res = Object.create(parent)
    if (child) {
        for (const key in child) {
            res[key] = child[key]
        }
    }

    return res
}

export function mergeOptions(parent, children) {
    const options = {}
    for (let key in parent) {
        mergeFile(key)
    }
    for (let key in children) {
        if (!parent[key]) {
            mergeFile(key)
        }
    }
    function mergeFile(key) {
        if (stratas[key]) {
            options[key] = stratas[key](parent[key], children[key])
        } else {
            options[key] = children[key] || parent[key]
        }
    }
    return options
}
