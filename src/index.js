import { initMixin } from './init'
import { initLifecycle } from './lifecycle'

function Vue(options) {
  //options 就是传入的options api
  this._init(options)
}

initMixin(Vue)
initLifecycle(Vue)
export default Vue
