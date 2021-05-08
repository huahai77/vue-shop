<template>
  <div class="add-goods">
    <!-- /********面包屑导航********/ -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- /*******卡片视图区域*******/ -->
    <el-card>
      <!-- 提示信息 -->
      <el-alert
        title="添加商品消息 "
        type="info"
        center
        show-icon >
      </el-alert>

      <!-- 步骤条 -->
        <!-- activeIndex - 0 转换为数字型 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 左侧便签页 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs tabPosition='left' v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="{ expandTrigger: 'hover', label: 'cat_name', value: 'cat_id', children: 'children'}"
                @change="handleChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTabData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border size="small"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action表示图片要上传的后台API地址 -->
            <el-upload
              :action="uploadURL"
              list-type="picture-card"
              :on-preview="handlePreview"
              :on-remove="handleRemove" 
              :headers="headerObj" 
              :on-success="handleSuccess">
              <i class="el-icon-plus"></i>
            </el-upload>
            <el-dialog :visible.sync="previewVisible">
              <img width="100%" :src="previewImageUrl" alt="">
            </el-dialog>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="confirmAdd" @click="confirmAdd">确认添加</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>

    </el-card>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  data() {
    return {
      // 默认激活
      activeIndex: '0',
      // 商品分类数据列表
      cateList: [],
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品的介绍详情
        goods_introduce: '',
        attrs: []
      },
      // 添加商品表单的验证规则
      addFormRules: {
        goods_name: [
          {required: true, message:'请输入商品名称', trigger: 'blur'}
        ],
        goods_price: [
          {required: true, message:'请输入商品价格', trigger: 'blur'}
        ],
        goods_weight: [
          {required: true, message:'请输入商品重量', trigger: 'blur'}
        ],
        goods_number: [
          {required: true, message:'请输入商品数量', trigger: 'blur'}
        ],
        goods_cat: [
          {required: true, message:'请输入商品分类', trigger: 'blur'}
        ]
      },
      // 动态参数列表数据
      manyTabData: [],
      // 静态属性列表数据
      onlyTableData: [],
      // 上传图片的URL地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 放大预览图片对话框显示与隐藏
      previewVisible: false,
      // 放大预览图片Url
      previewImageUrl: '',
    
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取所有商品分类数据列表
    async getCateList() {
      const {data: res} = await this.$http.get('categories')

      if(res.meta.status !== 200) {
        return this.$message.error("获取商品分类列表失败")
      }

      this.cateList = res.data
      console.log(this.cateList);
    },
    // 当选中项发生改变时触发该函数
    handleChange() {
      console.log(this.addForm.goods_cat)
      if(this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    beforeTabLeave(activeName, oldActiveName) {
      // console.log('离开' + oldActiveName);
      // console.log('现在' + activeName);
      if(oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类")
        return false
      }
    },
    async tabClicked() {
      // console.log(this.activeIndex)
      // 证明访问的是动态参数面板
      if(this.activeIndex === '1') {
        const {data: res} = await this.$http.get(
          `categories/${this.cateId}/attributes`, 
          {
            params: {sel: 'many'}
          }
        )

        if(res.meta.status !== 200) {
        return this.$message.error("获取动态参数列表失败")
        }

        console.log(res.data);
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length == 0 ? [] : item.attr_vals.split(' ')
        })
        // 赋值给动态参数列表
        this.manyTabData = res.data
      }else if(this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`, 
          {
            params: {sel: 'only'}
          }
        )

        if(res.meta.status !== 200) {
          return this.$message.error("获取静态属性失败")
        }
        console.log(res.data)
        this.onlyTableData = res.data
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      // console.log(file);
      this.previewImageUrl = file.response.data.url
      this.previewVisible = true
    },
    // 图片删除处理操作
    handleRemove(file) {
      console.log(file)
      // 1. 获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2. 从pics数组中找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      // 3. 调用数组的splice方法，把图片信息，从pics数组移除  
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    // 文件上传成功调用
    handleSuccess(response) {
      console.log(response);
      // 1.拼接得到一个图片信息对象
      const picInfo = {pic: response.data.tmp_path}
      // 2.将图片信息对象，push到pics数组中
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
    },
    // 确认添加
      confirmAdd() {
        // console.log(this.addForm)
        this.$refs.addFormRef.validate(async valid => {
          if(!valid) {
            return this.$message.error("请填写必填项")
          }
          // 执行添加的业务逻辑
          // lodash cloneDeep(value)
          // 利用lodash深拷贝进行操作，而不破坏原来的addForm数据
          const form = _.cloneDeep(this.addForm)
          form.goods_cat = form.goods_cat.join(',')
          // 处理动态参数
          this.manyTabData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(' ')
            }
            this.addForm.attrs.push(newInfo)
          })
          // 处理静态属性
          this.onlyTableData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals
            }
            this.addForm.attrs.push(newInfo)
          })
          form.attrs = this.addForm.attrs
          console.log(form)

          const {data: res} = await this.$http.post('goods', form)
          if(res.meta.status !== 201) {
            return this.$message.error("添加商品失败")
          }
          this.$message.success("添加商品成功")
          this.$router.push('/goods')
        })
      }
  },
  computed: {
    cateId() {
      if(this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 8px 0 0 !important;
}

.confirmAdd {
  margin-top: 10px;
}
</style>