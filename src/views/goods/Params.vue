<template>
  <div class="params">
    <!-- /********面包屑导航********/ -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- /*****卡片试图区域*****/ -->
    <el-card>
      <!-- 提示信息 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数!"
        type="warning"
        show-icon 
        :closable="false">
      </el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="categories">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联选择框 -->
          <el-cascader
            clearable 
            v-model="selectedCateKeys"
            :options="cateList"
            :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children'}"
            @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>

      <!-- tab标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数按钮 -->
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddParametersDialog">添加参数</el-button>
          <!-- 动态数据表格 -->
          <el-table :data="manyTableData" style="width: 100%" border stripe>
            <el-table-column type="expand" >
              <!-- 展开行 -->
              <template v-slot:default="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加Tag按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" ></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">修改</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性按钮 -->
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddParametersDialog">添加属性</el-button>
          <!-- 动态数据表格 -->
          <el-table :data="onlyTableData" style="width: 100%" border stripe>
            <el-table-column type="expand" >
              <!-- 展开行 -->
              <template v-slot:default="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加Tag按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" ></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">修改</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- ******添加参数对话框区域******** -->
    <el-dialog
      :title="'添加' + addTitle"
      :visible.sync="addParametersDialogVisible"
      width="50%" 
      @close="addParametersDialogClose">
      <!-- 对话框 -->
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="100px">
        <el-form-item :label="addTitle" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="addParametersDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </div>
    </el-dialog>

    <!-- !!!修改对话框 -->
    <el-dialog
      :title="'修改' + addTitle"
      :visible.sync="editParametersDialogVisible"
      width="50%" 
      @close="editParametersDialogClose">
      <!-- 对话框 -->
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="100px">
        <el-form-item :label="addTitle" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="editParametersDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类数据列表
      cateList: [],
      // 级联选择框双向绑定到的数组
      selectedCateKeys: [],
      // 默认被激活的页签
      activeName: 'many',
      // 动态栏的参数数据
      manyTableData: [],
      // 静态栏的参数数据
      onlyTableData: [],
      // 控制添加动态静态参数对话框的显示状态
      addParametersDialogVisible: false,
      // 添加表单的数据对象
      addForm: {
        attr_name: ''
      },
      // 添加表单的数据验证规则
      addFormRules: {
        attr_name: [
          {required: true, message:'请输入参数名称', trigger: 'blur'}
        ]
      },
      // 控制修改对话框的显示状态
      editParametersDialogVisible: false,
      // 修改表单的数据对象
      editForm: {
        attr_name: ''
      },
      // 修改表单的数据验证
      editFormRules: {
        attr_name: [
          {required: true, message:'请输入', trigger: 'blur'}
        ] 
      },
      
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if(res.meta.status !== 200) {
        return this.$message.error("获取商品分类数据失败")
      }
      console.log(this.cateList);
      this.cateList = res.data
    },
    // 当选中的ID发生变化时触发该函数
    handleChange() {
      this.getParamsData()  
    },
    // tab页签点击发生改变时触发此函数
    handleTabClick() {
      console.log(this.activeName);
      this.getParamsData()
    },
    // 获取参数的数据列表
    async getParamsData() {
      // 证明选择的不是三级分类
      if(this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 证明选择的是三级分类
      console.log(this.selectedCateKeys)
      // 证明是三级分类后，根据所选分类的ID和当前所在面板，获取对应参数
      const {data: res} = await this.$http.get(
        `categories/${this.cateId}/attributes`, 
        {
          params: {sel: this.activeName} 
        }
      )
      if(res.meta.status !== 200) {
        return this.$message.error("获取参数列表失败")
      }
      
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        //文本框输入的值
        item.inputValue = ''
      })
      console.log(res.data)
      if(this.activeName == 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 点击添加按钮显示对话框
    showAddParametersDialog() {
      this.addParametersDialogVisible = true
    },
    // 对话框关闭事件
    addParametersDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击确定按钮添加参数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if(!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`, 
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )

        if(res.meta.status !== 201) {
          return this.$message.error("添加参数失败")
        }
        
        this.$message.success("添加参数成功")
        this.addParametersDialogVisible = false
        this.getParamsData()
      })
    },
    // 点击控制显示修改框的显示状态
    async showEditDialog(attr_id) {
      // 查询当前参数的信息
      const {data: res} = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`, {
          params: {attr_sel: this.activeName}
      })
      if(res.meta.status !== 200) {
        return this.$message.error("获取参数信息失败")
      }
      this.editForm = res.data


      this.editParametersDialogVisible = true
    },
    // 修改对话框的关闭事件
    editParametersDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击确定修改参数信息
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name, attr_sel: this.activeName
        })

        if(res.meta.status !== 200) {
          return this.$message.error("修改参数失败")
        }

        this.$message.success("修改参数成功")
        this.getParamsData()
        this.editParametersDialogVisible = false
      })
    },
    // 根据ID删除对应的参数项
    async removeParams(attr_id) {
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        
        //! 用户取消了删除的操作
        if(confirmResult !== 'confirm') {
          return this.$message.info("已取消该操作")
        }

        //! 删除的业务逻辑
        const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
        if(res.meta.status !== 200) {
          return this.$message.error("删除参数失败")
        }
        this.$message.success("删除参数成功")
        this.getParamsData()
    },
    // 文本框失去焦点或者按下enter触发
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有return，则证明输入的内容，需要做后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 需要发起请求，保存这次操作
      this.saveAttrVals(row)
    },
    // 点击添加Tag按钮，显示文本框
    showInput(row) {
      row.inputVisible = true
      // 让文本框自动获得焦点                                
      this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
      })
    },
    // 删除对应的参数可选项
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    },
    // 将对 attr_vals 的操作，保存到数据库
    async saveAttrVals(row) {
      // 需要发起请求，保存这次操作
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败！')
      }

      this.$message.success('修改参数项成功！')
    },
  },
  computed: {
    // 控制按钮是否禁用
    isBtnDisabled() {
      //! 方法一
      // if(this.selectedCateKeys.length !== 3) {
      //   return true;
      // }else {
      //   return false;
      // }
      //! 方法二
      return this.selectedCateKeys.length !== 3
    },
    // 当前选中的三级ID
    cateId() {
      if(this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 动态添加标题
    addTitle() {
      if(this.activeName == 'many') {
        return "动态参数"
      }
      return "静态属性"
    }
  }
}
</script>

<style lang="less" scoped>
.categories {
  margin-top: 15px;
}

.el-tag {
  margin: 15px;
}

.input-new-tag {
  width: 80px;
}
</style>