import { createElementVNode, createTextVNode } from './vdom/index'

function createElm(VNode) {
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
  //   debugger
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
  }
}

export function initLifecycle(Vue) {
  /**
   * _update函数的功能是把Vnode转成真实dom
   */

  Vue.prototype._update = function (VNode) {
    const vm = this
    const el = vm.$el
    /**
     * patch函数既有初始化的功能,又有更新的功能
     */
    vm.$el = patch(el, VNode)
  }

  /**
   * render函数中的_c,_v,_s方法
   * _c('div', {id:"app",style:{"color":"red"}},
   * _v(_s(name)+'hello'+_s(age)+'world'))
   */
  Vue.prototype._c = function (...args) {
    return createElementVNode(this, ...args)
  }
  Vue.prototype._v = function (...args) {
    return createTextVNode(this, ...args)
  }
  Vue.prototype._s = function (value) {
    return JSON.stringify(value)
  }
  /**
   * 通过render函数生成虚拟dom
   */
  Vue.prototype._render = function () {
    // console.log('render')
    const vm = this
    //为了让with中的this指向vm
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
