import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
//字体图标
import '@/assets/fonts/iconfont.css'
// 导入全局样式表
import '@/assets/css/global.css'
//axios
import axios from 'axios'
//配置axios根路径
axios.defaults.baseURL = 'http://api.zreai.com:606/api/private/v1/'
Vue.prototype.$http = axios






Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
