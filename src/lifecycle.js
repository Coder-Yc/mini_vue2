import { createElementVNode, createTextVNode } from './vdom/index'

function createElm(VNode) {
  /**
   * 这个方法用来根据虚拟节点创建真实的节点
   * 首先拿到虚拟节点中的标签,属性,孩子节点和文本
   * 然后判断标签是不是字符串,如果是就说明是一个文本标签,否则就是一个文本标签
   * 如果标签节点,首先创建一个标签挂载到虚拟dom的el上,为了让虚拟dom和真实dom练习起来
   * 然后再去调用patchProps挂载属性
   * 最后遍历孩子节点,递归的创建孩子节点,把这个孩子节点插入到VNode.el里
   *
   */
  const { tag, data, children, text } = VNode
  if (typeof tag === 'string') {
    // debugger
    VNode.el = document.createElement(tag)
    patchProps(VNode.el, data)
    children.forEach((child) => {
      VNode.el.appendChild(createElm(child))
    })
  } else {
    VNode.el = document.createTextNode(text)
  }
  return VNode.el
}
function patchProps(el, data) {
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

function patch(oldVNode, VNode) {
  //debugger
  /**
   * patch这个方法是用来把虚拟节点挂载到真实dom上的
   * 首先判断传过来的旧的节点是不是标签类型
   * 如果是就说明是第一次挂载,然后拿到旧节点父级节点
   * 然后再通过createElm传入虚拟节点创建一个真实的dom节点,拿到这个新的节点
   * 然后再插入到父级节点的最后一个节点中
   * 最后再删除旧的节点,
   */
  const isRealNode = oldVNode.nodeType
  if (isRealNode) {
    const elm = oldVNode
    const parentElm = elm.parentNode
    let newElm = createElm(VNode)
    parentElm.insertBefore(newElm, parentElm.nextSibling)
    parentElm.removeChild(elm)
    console.log(newElm)
    return newElm
  } else {
    /**
     * diff算法
     */
  }
}

export function initLifecycle(Vue) {
  Vue.prototype._update = function (VNode) {
    /**
     * _update函数的功能是把Vnode转成真实dom
     * 里面的patch函数既有初始化的功能,又有更新的功能
     * 让patch函数有个返回值,就能把这次的最新的节点放到vm.$el,下次更新就能取到这个el
     */
    const vm = this
    const el = vm.$el

    vm.$el = patch(el, VNode)
  }

  /**
   * render函数中的_c,_v,_s方法
   * _c('div', {id:"app",style:{"color":"red"}},
   * _v(_s(name)+'hello'+_s(age)+'world'))
   */
  Vue.prototype._c = function (...args) {
    /**产生一个标签虚拟节点 */
    return createElementVNode(this, ...args)
  }
  Vue.prototype._v = function (...args) {
    /**
     * 产生一个文本虚拟节点
     */
    return createTextVNode(this, ...args)
  }
  Vue.prototype._s = function (value) {
    /**
     * 调用_s方法返回一个字符串value值
     */
    return JSON.stringify(value)
  }

  Vue.prototype._render = function () {
    /**
     * 通过render函数生成虚拟dom
     * 调用call为了让with中的this指向vm
     * * @return 一个由render函数产生的虚拟dom
     */
    const vm = this

    return vm.$options.render.call(vm)
  }
}

export function mountComponent(vm, el) {
  vm.$el = el
  /**
   * 调用render方法产生虚拟节点,虚拟dom
   */
  vm._update(vm._render())

  /**
   * 根据虚拟dom产生真实dom
   */

  /**
   * 插入到el上
   */
}
