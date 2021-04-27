import Vue from 'vue'
import 'element-ui/lib/theme-chalk/index.css'   //element样式
// element-ui组件
import { 
    Form, 
    FormItem, 
    Input, 
    Message, 
    Button
} from 'element-ui'


Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.prototype.$message = Message