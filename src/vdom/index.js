/**
 * 创建虚拟标签节点
 * 传过来的属性值attrs就是这个data,key值一般也放到这个里面
 */
function isReserveTag(tag) {
    return ['div', 'p', 'ul', 'li', 'span', 'button'].includes(tag)
}

export function createElementVNode(vm, tag, data, ...children) {
    if (data == null) {
        data = {}
    }
    let key = data.key
    if (!key) {
        delete data.key
    }
    if (isReserveTag(tag)) {
        return VNode(vm, tag, data.key, data, children)
    } else {
        //创造一个带有构造函数的虚拟节点(包含组件的构造函数)
        let Ctor = vm.$options.component[tag] //组件的构造函数
        return createComponentVNode(vm, tag, key, data, children, Ctor)
    }
}

function createComponentVNode(vm, tag, key, data, children, Ctor) {
    if (typeof Ctor === 'object') {
        Ctor = vm.$options._base.extend(Ctor)
    }
    // 在虚拟节点上定义一个钩子函数,一会创建真实节点的时候调用他挂载
    data.hook = {
        init(vnode) {
            //稍后调用组件真实节点的时候,如果调用就用调用这个方法
            //保存组件的实例挂载到虚拟节点上
            let instance = (vnode.componentInstance =
                new vnode.componentOptions.Ctor())
            instance.$mount()       
        }
    }
    return VNode(vm, tag, key, data, children, null, { Ctor })
}

/**
 * 创建虚拟文本节点
 */
export function createTextVNode(vm, text) {
    return VNode(vm, undefined, undefined, undefined, undefined, text)
}

/**
 *
 * @param {*vue实例} vm
 * @param {*标签名} tag
 * @param {*key值} key
 * @param {*数据} data
 * @param {*孩子节点} children
 * @param {*文本节点} text
 * @returns 虚拟节点
 */

function VNode(vm, tag, key, data, children, text, componentOptions) {
    return {
        vm,
        tag,
        key,
        data,
        children,
        text,
        componentOptions //组件的构造函数
    }
}
