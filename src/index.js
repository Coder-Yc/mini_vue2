import { initMixin } from './init'

function Vue(options) {
  //options 就是传入的options api
  this._init(options)
}

initMixin(Vue)

export default Vue
