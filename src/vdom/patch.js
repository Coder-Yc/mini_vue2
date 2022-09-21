/**
 * 拿到虚拟节点上的hook
 */
function createComponent(vnode) {
    let i = vnode.data

    if ((i = i.hook) && (i = i.init)) {
        i(vnode) //初始化组件,这里会调用勾子去挂载
    }
    if (vnode.componentInstance) {
        return true
    }
}
function createElm(VNode) {
    /**
     * 这个方法用来根据虚拟节点创建真实的节点
     * 首先拿到虚拟节点中的标签,属性,孩子节点和文本
     * 然后判断标签是不是字符串,如果是就说明是一个文本标签,否则就是一个标签节点
     * 如果标签节点,首先创建一个标签挂载到虚拟dom的el上,为了让虚拟dom和真实dom练习起来
     * 然后再去调用patchProps挂载属性
     * 最后遍历孩子节点,递归的创建孩子节点,把这个孩子节点插入到VNode.el里
     *
     */
    const { tag, data, children, text } = VNode
    if (typeof tag === 'string') {
        //标签
        //创建真实元素,也要区分是组件还是元素
        if (createComponent(VNode)) {
            return VNode.componentInstance.$el
        }
        // 挂载到虚拟节点上的el上,一会返回
        VNode.el = document.createElement(tag)
        patchProps(VNode.el, {}, data)
        children.forEach((child) => {
            VNode.el.appendChild(createElm(child))
        })
    } else {
        VNode.el = document.createTextNode(text)
    }
    return VNode.el
}

function patchProps(el, oldProps = {}, data = {}) {
    /**
     * 老的属性中有要需要删除的属性
     */
    const oldStyle = oldProps.style || {}
    const newStyle = data.style || {}
    for (const key in oldStyle) {
        if (!newStyle[key]) {
            el.style[key] = ''
        }
    }
    for (const key in oldProps) {
        if (!data[key]) {
            el.removeAttribute(key)
        }
    }

    /**
     * 把属性挂载到el实例上,主要是普通属性和style属性
     * style属性需要遍历里面的属性去挂载
     */
    for (let key in data) {
        if (key === 'style') {
            for (let styleName in data.style) {
                el.style[styleName] = data.style[styleName]
            }
        } else {
            el.setAttribute(key, data[key])
        }
    }
}
function isSameVNode(VNode1, VNode2) {
    return VNode1.tag === VNode2.tag && VNode1.key === VNode2.key
}
export function patch(oldVNode, VNode) {
    /**
     * patch这个方法是用来把虚拟节点挂载到真实dom上的
     * 首先判断传过来的旧的节点是不是标签类型
     * 如果是就说明是第一次挂载,然后拿到旧节点父级节点
     * 然后再通过createElm传入虚拟节点创建一个真实的dom节点,拿到这个新的节点
     * 然后再插入到父级节点的最后一个节点中
     * 最后再删除旧的节点,
     */
    if (!oldVNode) {
        //组件的挂载
        debugger
        return createElm(VNode)
    }
    const isRealNode = oldVNode.nodeType
    if (isRealNode) {
        const elm = oldVNode
        const parentElm = elm.parentNode

        let newElm = createElm(VNode)
        parentElm.insertBefore(newElm, parentElm.nextSibling)
        parentElm.removeChild(elm)

        return newElm
    } else {
        /**
         * diff算法
         */
        return patchVNode(oldVNode, VNode)
    }
}
function patchVNode(oldVNode, VNode) {
    //如果标签节点不相同,就用老节点的父亲节点开始替换
    if (!isSameVNode(oldVNode, VNode)) {
        let el = createElm(VNode)
        oldVNode.el.parentNode.replaceChild(el, oldVNode.el)
        return el
    }
    //文本的情况
    let el = (VNode.el = oldVNode.el)
    if (!oldVNode.tag) {
        if (oldVNode.text !== VNode.text) {
            oldVNode.el.textContent = VNode.text
        }
    }
    //是标签 是我们需要比对的属性
    patchProps(el, oldVNode.data, VNode.data)

    //比较儿子节点 一方有儿子节点 一方没有儿子节点/两方都有儿子
    let oldChildren = oldVNode.children || []
    let newChildren = VNode.children || []

    if (oldChildren.length > 0 && newChildren.length > 0) {
        //完整的diff算法,需要比较两个人的儿子
        /**
         * 在同级的时候, 老得节点序列和新的都有开始和结束的指针,当开始指针小于结束指针时,会循环去比较,
         * 当新的开始指针小于新的结束的时候,就把新的剩余的添加到老节点上,反之如果是老得话,那就把老的砍掉
         * 循环里面有四种查找方法,如果交叉比对找到时那就去插入到前面或者后面,然后再递归去patch
         * 最后找不到时,就去乱序查找,维护了一个map,根据node的key去查找,找到就插入,找不到就创建
         * 这也是为什么需要key的原因,能更快更准确的查找到
         */
        updateChildren(el, oldChildren, newChildren)
    } else if (newChildren.length > 0) {
        mountChildren(el, newChildren)
    } else if (oldChildren.length > 0) {
        el.innerHtml = ''
    }
}
function mountChildren(el, newChildren) {
    newChildren.forEach((elm) => {
        el.appendChild(createElm(elm))
    })
}
function updateChildren(el, oldChildren, newChildren) {
    let oldStartIndex = 0
    let newStartIndex = 0
    let oldEndIndex = oldChildren.length - 1
    let newEndIndex = newChildren.length - 1

    let oldStartVNode = oldChildren[oldStartIndex]
    let newStartVNode = newChildren[newStartIndex]

    let oldEndVNode = oldChildren[oldEndIndex]
    let newEndVNode = newChildren[newEndIndex]

    function makeIndxById(children) {
        const map = {}
        children.forEach((child, index) => {
            map[child.key] = index
        })
        return map
    }
    const map = makeIndxById(oldChildren)

    //循环的时候为什么要加上key
    //在给动态列表添加key的时候尽量避免使用索引,因为索引前后都是0开始的,可能发生错误复用
    while (oldStartIndex <= oldEndIndex || newStartIndex <= newEndIndex) {
        if (!oldStartVNode) {
            oldStartVNode = oldChildren[++oldStartIndex]
        } else if (!oldEndVNode) {
            oldEndVNode = oldChildren[--oldEndIndex]
        }
        //双方有一方头指针大于尾部指针则停止循环
        else if (isSameVNode(oldStartVNode, newStartVNode)) {
            patchVNode(oldStartVNode, newStartVNode)
            oldStartVNode = oldChildren[++oldStartIndex]
            newStartVNode = newChildren[++newStartIndex]
        } else if (isSameVNode(oldEndVNode, newEndVNode)) {
            patchVNode(oldEndVNode, newEndVNode)
            oldEndVNode = oldChildren[--oldEndIndex]
            newEndVNode = newChildren[--newEndIndex]
        } else if (isSameVNode(oldEndVNode, newStartVNode)) {
            //交叉比对
            patchVNode(oldEndVNode, newStartVNode)
            el.insertBefore(oldEndVNode.el, oldStartVNode.el)
            oldEndVNode = oldChildren[--oldEndIndex]
            newStartVNode = newChildren[++newEndIndex]
        } else if (isSameVNode(oldStartVNode, newEndVNode)) {
            patchVNode(oldStartVNode, newEndVNode)
            el.insertBefore(oldStartVNode.el, oldEndVNode.el.nextSibling)
            oldStartVNode = oldChildren[++oldStartIndex]
            newEndVNode = newChildren[--newEndIndex]
        } else {
            //乱序比对
            let moveIndex = map[newStartVNode.key]
            if (!moveIndex) {
                let moveVNode = oldChildren[moveIndex]
                el.insertBefore(moveVNode.el, oldStartVNode.el)
                oldChildren[moveIndex] = undefined
                patchVNode(moveVNode, newStartVNode)
            } else {
                el.insertBefore(createElm(newStartVNode), oldStartVNode.el)
            }
            newStartVNode = newChildren[++newStartIndex]
        }
    }
    if (newStartIndex <= newEndIndex) {
        // 多余的就插进去
        for (let i = newStartIndex; i < newEndIndex; i++) {
            const elm = createElm(newChildren[i])
            //这里可能是往后追加,也有可能是往前追加
            let anchor = newChildren[newEndIndex + 1]
                ? newChildren[newEndIndex + 1]
                : null
            el.insertBefore(elm, anchor)
        }
    }
    if (oldStartIndex <= newEndIndex) {
        //老的多余的就删除
        for (let i = oldStartIndex; i < newEndIndex; i++) {
            if (oldChildren[i]) {
                el.removeChild(oldChildren[i].el)
            }
        }
    }
}
