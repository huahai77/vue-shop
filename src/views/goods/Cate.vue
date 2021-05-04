<template>
  <div class="cate">
    <!-- /********面包屑导航********/ -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- /*****卡片试图区域*****/ */ -->
    <el-card>
      <!-- 商品按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加商品</el-button>
        </el-col>  
      </el-row>
      <!-- 表格区域 -->
      <tree-table 
      class="treeTable"
      :data="cateList" 
      :columns="columns" 
      :selection-type="false" 
      :expand-type="false" 
      show-index 
      index-text="#" 
      border>
      <!-- 是否有效 -->
        <template v-slot:isok="scope">
          <i class="el-icon-success" v-if="!scope.row.cat_deleted" style="color: lightgreen"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
      <!-- 排序 -->
        <template v-slot:order="scope">
          <el-tag size="mini" v-if="scope.row.cat_level == 0">一级</el-tag>
          <el-tag type="info" size="mini" v-else-if="scope.row.cat_level == 1">二级</el-tag>
          <el-tag type="danger" size="mini" v-else>三级</el-tag>
        </template>
      <!-- 操作按钮 -->
        <template v-slot:opt="scope"> 
          <el-button type="primary" icon="el-icon-edit" size="mini">修改</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>
      <!-- 底部分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- ****添加分类对话框区域***** -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%" 
      @close="addCateDialogClosed">
      <!-- 添加分类的表单 -->
      <el-form 
      :model="addCateForm" 
      :rules="addCateFormRules" 
      ref="addCateFormRef" 
      label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- /*options用来指定数据源*/ -->
          <el-cascader 
            clearable
            v-model="selectedKeys"
            :options="parentCateList"
            :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children', checkStrictly: true}"
            @change="parentCateChanged">
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        // ?当前页码
        pagenum: 1,
        //?每页显示多少条
        pagesize: 5
      },
      // 所有商品分类数据列表
      cateList: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        { 
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'opt'
        }
      ],
      // 控制添加分类按钮对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类名称
        cat_name: '',
        // 父级分类ID
        cat_pid: 0,
        // 分类的等级，默认要添加的是1级分类
        cat_level: 0
      },
      // 添加分类的验证规则对象
      addCateFormRules: {
        cat_name: [
          {required: true, message:'请输入要添加的分类名称', trigger: 'blur'}, 
          {min: 1, max: 5, message: '长度在 1 到 5 个字符', trigger: 'blur'}
        ],
      },
      // 父级商品分类数据列表
      parentCateList: [],
      // 选中的父级分类的ID数组
      selectedKeys: []
    }
  },
  // !在实例创建完成后被立即调用
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品数据列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {params:this.queryInfo})

      if(res.meta.status !== 200) {
        return this.$message.error("获取商品数据失败")
      }
      
      // console.log(res.data);
      // 将数据列表赋值给catelist
      this.cateList = res.data.result
      // 将数据条数赋值给total
      this.total = res.data.total
    },
    //监听pagesize的改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听当前的pagenum页码值
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击添加商品对话框的显示事件
    showAddCateDialog() {
      // 点击按钮时就获取父级商品分类的数据
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    //获取父级商品分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {params: {type: 2}})

      if(res.meta.status !== 200) {
        return this.$message.error("获取父级数据失败")
      }
      // console.log(res.data);
      this.parentCateList = res.data
    },
    //选择项发生改变触发事件
    parentCateChanged() {
      console.log(this.selectedKeys)
      //如果selwctedKeyas数组中的length大于0，证明选择的父级分类
      //反之就没有选中任何父级分类
      if(this.selectedKeys.length > 0) {
        //父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        //为当分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      }else {
        //父级分类的id
        this.addCateForm.cat_pid = 0
        //为当前分类的等级赋值
        this.addCateForm.cat_level = 0 
      }
    },
    // 点击添加按钮添加新的分类
    addCate() {
      console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$http.post('categories', this.addCateForm)
        if(res.meta.status != 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()  //重新获取列表
        this.addCateDialogVisible = false   //关闭对话框
      })
    },
    //监听添加分类对话框关闭事件
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>