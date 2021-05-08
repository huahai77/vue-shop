<template>
  <div class="list">
    <!-- /********面包屑导航********/ -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- /******卡片试图区域******/ -->
    <el-card>
      <el-row :gutter="20">
        <!-- 搜索框 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model.trim="queryInfo.query" clearable @clear="getPagingDataList">
            <el-button slot="append" icon="el-icon-search" @click="getPagingDataList"></el-button>
          </el-input>
        </el-col>
        <!-- 添加商品按钮 -->
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <el-table
        :data="goodsList"
        style="width: 100%" 
        border 
        stripe>
        <!-- 索引列 -->
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template v-slot:default="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" circle size="medium"></el-button>
            <el-button type="danger" icon="el-icon-delete" circle size="medium" @click="removeById(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 底部分页区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total" 
      background>
    </el-pagination>
    </el-card>

  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询参数对象
      queryInfo: {
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 10
      },
      // 商品数据列表
      goodsList: [],
      // 总共商品条数
      total: 0
    }
  },
  created() {
    this.getPagingDataList()
  },
  methods: {
    // 根据分页获取对应的商品列表
    async getPagingDataList() {
      const { data: res } = await this.$http.get(
        'goods', {params: this.queryInfo}
      )
      if(res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败")
      }

      this.$message.success("获取商品列表成功")
      // console.log(res.data)
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // 每页显示的条数大小发生改变时触发
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getPagingDataList()
    },
    // 当当前页码值发生改变触发
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getPagingDataList()
    },
    // 删除对应Id项的行
    async removeById(id) {
      // 先提示用户是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
      
      if(confirmResult !== 'confirm') {
        return this.$message.info("已取消本次操作")
      }

      const {data: res} = await this.$http.delete(`goods/${id}`)
      if(res.meta.status !== 200) {
        return this.$message.error("删除失败")
      }

      this.$message.success("删除成功")
      // 重新获取商品列表
      this.getPagingDataList()
    },
    // 
    goAddPage() {
      this.$router.push('/goods/add')
    } 
  },
}
</script>

<style lang="less" scoped>

</style>