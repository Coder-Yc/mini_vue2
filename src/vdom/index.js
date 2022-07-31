/**
 * 创建虚拟标签节点
 * 传过来的属性值attrs就是这个data,key值一般也放到这个里面
 */
export function createElementVNode(vm, tag, data, ...children) {
    if (data == null) {
        data = {}
    }
    let key = data.key
    if (!key) {
        delete data.key
    }
    return VNode(vm, tag, data.key, data, children)
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

function VNode(vm, tag, key, data, children, text) {
    return {
        vm,
        tag,
        key,
        data,
        children,
        text
    }
}
