import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
//字体图标
import '@/assets/fonts/iconfont.css'
// 导入全局样式表
import '@/assets/css/global.css'
//axios调入
import axios from 'axios'
// TreeTable导入
import TreeTable from 'vue-table-with-tree-grid'


//配置axios根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//    axios请求拦截
axios.interceptors.request.use(config => {
  // console.log(config)
  //      为请求头对象，添加token验证的Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  //    在最后必须return config
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
