import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/components/Login'
import Home from '@/views/home/Home'

//!子组件
import Welcome from '@/views/home/children/Welcome'
import Users from '@/views/user/Users'
import Rights from '@/views/power/Rights'
import Roles from '@/views/power/Roles'
import Cate from '@/views/goods/Cate'
import Params from '@/views/goods/Params'
import GoodsList from '@/views/goods/List'
import AddGoods from '@/views/goods/children/AddGoods'
import Order from '@/views/order/Order'
import Report from '@/views/report/Report'


// !使用路由
Vue.use(VueRouter)
const routes = [
  {
    path: '/',
    // redirect重定向
    redirect: '/login'
  },
  //登录
  {
    path: '/login',
    component: Login
  },
  //主页
  {
    path: '/home',
    component: Home,
    redirect: '/Welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights},
      { path: '/roles', component: Roles},
      { path: '/categories', component: Cate},
      { path: '/params', component: Params},
      { path: '/goods', component: GoodsList},
      { path: '/goods/add', component: AddGoods },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  },
]

const router = new VueRouter({
  mode: 'history',
  //配置路由与组件之间的应用关系
  routes,
})

//!挂载导航守卫
router.beforeEach((to, from, next) => {
  /* to.path !== '/login' && !localStorage.getItem('token') &&next('login') || next()  ==究极写法*/
  //to 将要访问的路径
  //from 代表从哪个路径跳转而来
  //next 是一个函数, 表示放行
  //       next() 放行      next('login)  强制跳转
  if (to.path === '/login') return next()
  //!!获取token  getItem是获取  
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login') //如果没有token 强制跳转到login
  next()  //放行
})

export default router
