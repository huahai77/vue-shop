<template>
  <div class="home">
    <el-button type="danger" @click="logout">退出用户</el-button>
  </div>
</template>

<script>
export default {
  name: 'Home',
  methods: {
    //? 退出登录
    logout() {
      window.sessionStorage.clear();  //!删除所有保存的数据
      this.$router.push('/login');    //!跳转到login 
    }
  }
}
</script>

<style lang="less" scoped>

</style>