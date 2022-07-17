export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    //由于其他原型方法上也需要使用options, 所以把options挂载到实例上
    const vm = this
    vm.$options = options //把用户的选项挂载到实例上
    //初始化数据状态(options)
    initState(vm)
  }
}

function initState(vm) {
  const opts = vm.$options
  if (opts.data) {
    initData(vm)
  }
}

function initData(vm) {
  let data = vm.$options.data
  data = typeof data === 'function' ? data.call(vm) : data
  console.log(data)
}