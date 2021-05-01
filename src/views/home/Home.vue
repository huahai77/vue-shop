<template>
  <el-container class="home-container">
    <!--！！！ 头部区域 -->
    <el-header>
      <div>
        <img src="@/assets/img/xiaomai.jpg" alt="" />
        <span>小埋电商后台管理系统</span>
      </div>
      <el-button @click="logout" type="info">注销</el-button>
    </el-header>
    <!-- ！！！页面主体区域 -->
    <el-container>
      <!-- 侧边栏区域 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="folding">|||</div>
        <!-- 侧边栏菜单区域 -->
        <el-menu 
        background-color="#333744" 
        text-color="#fff" 
        active-text-color="#409EFF" 
        unique-opened 
        :collapse="isCollapse"
        :collapse-transition="false" 
        router 
        :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu :index="item.id.toString()" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template> 

              <!-- 二级菜单 -->
              <el-menu-item :index="'/' + subItem.path" 
                            v-for="subItem in item.children" 
                            :key="subItem.id" 
                            @click="SaveState('/' + subItem.path)">
                <template slot="title">
                  <!-- 图标 -->
                  <i class="el-icon-menu"></i>
                  <!-- 文本 -->
                  <span>{{subItem.authName}}</span>
                </template> 
              </el-menu-item>
            </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主体区域 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>

export default {
  name: "Home",
  data() {
    return {
      //左侧栏菜单数据
      menulist: [],
      iconsObj: {
        125: "iconfont icon-users",
        103: "iconfont icon-tijikongjian",
        101: "iconfont icon-3702mima",
        102: "iconfont icon-danju",
        145: "iconfont icon-baobiao",
      },
      //是否折叠
      isCollapse: false,
      // 被激活的链接地址
      activePath: '',
    };
  },
  // 被创建时执行函数
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    //? 退出登录
    logout() {
      window.sessionStorage.clear(); //!删除所有保存的数据
      this.$router.push("/login"); //!跳转到login
    },
    //获取所有的菜单
    async getMenuList() {
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menulist = res.data;
      console.log(res);
    },
    //切换折叠或展开
    folding() {
      this.isCollapse = !this.isCollapse;
    },
    // 保存链接的激活状态
    SaveState(activePath) {
      window.sessionStorage.setItem('activePath', activePath);
      this.activePath = activePath;
    },
  },
};
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;

  .el-header {
    // #373d41
    background-color: #373D41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    font-size: 22px;
    font-weight: bold;
    > div {
      display: flex;
      align-items: center;
    }
    img {
      border-radius: 50%;
      margin-right: 20px;
    }
  }

  .el-aside {
    background-color: #333744;
    .el-menu {
      border-right: none;
    }
    .toggle-button {
      background-color: #4a5064;
      line-height: 24px;
      text-align: center;
      color: #fff;
      letter-spacing: 2px;
      cursor: pointer;
    }
  }

  .el-main {
    background-color: #eaedf1;
  }
  .iconfont {
    margin-right: 10px;
  }
}
</style>