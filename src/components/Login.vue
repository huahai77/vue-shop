<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="@/assets/img/mai.jpg" alt="">
      </div>
      <!-- 登录表单区域 -->
      <el-form class="login_form" :model="loginForm" :rules="loginFormRules" ref="loginFromRef">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username">
            <i slot="prefix" class="iconfont icon-user"></i>
          </el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" show-password>
            <i slot="prefix" class="iconfont icon-lock_fill"></i>
          </el-input>
        </el-form-item>
      <!-- 登录按钮区域 -->
      <el-form-item class="btns">  
        <el-button type="primary" @click="login">登录</el-button>
        <el-button type="info" @click="resetLoginForm">重置</el-button>
      </el-form-item>
    </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      // !登录表单的数据绑定对象
      loginForm: {
        username: "admin",
        password: "123456"
      },
      // !表单验证规则对象
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 4, max: 15, message: '长度在 4 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    //*点击重置事件 清空表单 */
    resetLoginForm() {
      // console.log(this);
      // resetFields方法为对整个表单进行重置
      this.$refs.loginFromRef.resetFields()
    },
    //* 登录事件*/
    login() {
      this.$refs.loginFromRef.validate(async valid => {
        if(!valid) return;
        const {data: res} = await this.$http.post("login", this.loginForm);
        if(res.meta.status !== 200) return this.$message.error("登录错误，请输入正确信息!"); 
        this.$message.success("登录成功!");
        // console.log(res);
        //! 1.登录成功之后的token，保存到客户端的 sessionStorage 中
        //!    1.1 项目中除了登录之外的其他API接口，必须在登陆之间才能访问
        //!    1.2 token 只应在当前网站打开期间生效，所以将 token 保存在 sessionStorage 中
        //!! setItem是设置
        window.sessionStorage.setItem("token", res.data.token);
        //! 2.通过编程式导航跳转到后台主页，路由地址是 /home
        this.$router.push('/home');
      })
    },

  }
}
</script>

<style lang="less" scoped>
.login_container {
  height: 100%;
  background-color: #2b4b6b;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
/* //! 头像 */
  .avatar_box {
    width: 130px;
    height: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 3px;
    box-shadow: 3px 10px 15px #ddd;
    margin: -65px auto;
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
/* // !用户和密码 */
  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    /* //怪异盒模型 */
    box-sizing: border-box; 
  }
/* //! 按钮 */
  .btns {
    display: flex;
    justify-content: flex-end;
  }


}
</style>
