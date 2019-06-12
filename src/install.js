import View from './components/view'
import Link from './components/link'

// 定义了全局变量 _Vue
export let _Vue

// 全局混入钩子函数，并全局注册2个组件
export function install (Vue) {
  // install 只调用一次
  if (install.installed && _Vue === Vue) return
  install.installed = true
  
  // 将Vue赋值给全局变量_vue
  _Vue = Vue

  const isDef = v => v !== undefined

  const registerInstance = (vm, callVal) => {
    // 当前组件在父组件中的占位节点
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }

  Vue.mixin({
    // 在beforeCreate钩子执行时，初始化路由，进行注册
    beforeCreate () {
      // 只有根组件存在路由，所以先判断是否存在路由对象，存在，则初始化路由
      if (isDef(this.$options.router)) {
        // 存在路由对象，则根路由设置为自己
        this._routerRoot = this
        this._router = this.$options.router
        // 初始化路由
        this._router.init(this)
        // 为route属性实现双向绑定，触发组件渲染
        // defineReactive()定义响应式数据的核心函数
        // 1. 新建一个dep对象，与当前数据对应
        // 2. 通过Object.defineProperty()重新定义属性，配置属性的set、get
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        // 当前没有router信息，找上一级存在根路由的父级，=》用于router-view层级判断
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    
    // 注销时采用registerInstance()？
    destroyed () {
      registerInstance(this)
    }
  })

  // 将根路由的_router信息绑定到$router属性上
  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  // 将根路由的_route信息绑定到$route属性上
  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })

  // 全局注册 `router-view` 组件
  Vue.component('RouterView', View)
  // 全局注册 `router-link` 组件
  Vue.component('RouterLink', Link)

  const strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
