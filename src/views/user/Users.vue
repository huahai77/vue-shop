<template>
  <div class="users">
    <!-- /********面包屑导航********/ -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- /*******卡片区域 ***********/-->
    <el-card class="box-card">
        <!-- /*搜索框区域*/ -->
        <el-row :gutter="20">
          <el-col :span="7">
            <el-input
              placeholder="请输入内容"
              class="input-with-select" 
              v-model="queryInfo.query" 
              clearable 
              @clear="getUserList"
            >
              <el-button
                slot="append"
                icon="el-icon-search" 
                @click="getUserList"
              ></el-button>
            </el-input>
          </el-col>
          <!-- 添加用户按钮区域 -->
          <el-col :span="3">
            <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
          </el-col>
        </el-row>
        <!-- 用户列表区域 -->
        <el-table :data="userlist" border stripe>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="姓名" prop="username"></el-table-column>
          <el-table-column label="邮箱" prop="email"></el-table-column>
          <el-table-column label="电话" prop="mobile"></el-table-column>
          <el-table-column label="角色" prop="role_name"></el-table-column>
          <el-table-column label="状态">
            <template v-slot:default="slotProps">
              <el-switch v-model="slotProps.row.mg_state" @change="userStateChange(slotProps.row)"></el-switch>
            </template>
          </el-table-column>
          <!-- 操作按钮区域 -->
          <el-table-column label="操作">
            <template v-slot:default="slotProps">
              <!-- 修改按钮 -->
                <el-button type="primary" icon="el-icon-edit" circle @click="showEditDialog(slotProps.row.id)"></el-button>
              <!-- 删除按钮 -->
                <el-button type="danger" icon="el-icon-delete" circle @click="removeUserById(slotProps.row.id)"></el-button>
              <!-- 分配角色按钮 -->
              <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
                <el-button type="warning" icon="el-icon-setting" circle @click="showRolesdialog(slotProps.row)"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <!-- /*分页区域*/ -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1, 2, 5, 10]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
    </el-card>
    <!-- /*添加用户对话框*/ -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="dialogClose">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!--/*修改按钮对话框*/ -->
    <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <!--      表单 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--      按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click.stop="editNameInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- /* 分配角色对话框*/ -->
    <el-dialog
      title="分配角色" :visible.sync="assigningRolesdialogVisible" width="50%" @close="assignRoleDialogClosed">
      <div>
        <p>当前用户: {{userInfo.username}}</p>
        <p>当前角色: {{userInfo.role_name}}</p>
        <p>
          分配新角色: 
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="assigningRolesdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>


<script>
export default {
  name: "users",
  data() {
    // 验证邮箱的规则
    let checkEmail = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regEmail = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/
      if(regEmail.test(value)) {
        // 合法的邮箱
        return callback()
      }
      callback(new Error("请输入正确格式的邮箱"))
    }
    // 验证手机号的规则
    let checkMobile = (rule, value, callback) => {
      // 验证手机的正则表达式
      const regMobile = /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-79])|(?:5[0-35-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[189]))\d{8}$/

      if(regMobile.test(value)) {
        // 合法的手机号
        return callback()
      }
      callback(new Error("请输入正确格式的手机号码"))
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        // 用户
        query: '',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2
      },
      // 用户列表
      userlist: [],
      // 总数据
      total: 0,
      // 控制添加对话框的显示与隐藏
      addDialogVisible: false,
      // 添加用户表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      // 添加表单的验证规则对象
      addFormRules: {
        username: [{
          required: true, 
          message:'请输入用户名', 
          trigger: 'blur'}, {
            min: 3, 
            max: 10, 
            message: "用户名要求在3~10个字符之间", 
            trigger: 'blur'
          }],
          password: [{
            required: true, 
            message:'请输入密码', 
            trigger: 'blur'}, {
              min: 6, 
              max: 15, 
              message: "密码要求在6~15个字符之间", 
              trigger: 'blur'
            }],
            email: [{
            required: true, 
            message:'请输入邮箱', 
            trigger: 'blur'
            },{
              validator: checkEmail, 
              trigger: 'blur'
            }],
            mobile: [{
            required: true, 
            message:'请输入手机号', 
            trigger: 'blur'
            },{
              validator: checkMobile, 
              trigger: 'blur'
            }],
      },
      //编辑对话框默认不显示
      editDialogVisible: false,
      // 查询到的用户信息对象
      editForm: {},
      // 添加表单的验证规则对象
      editFormRules: {
        email: [
          {
          required: true, 
          message:'请输入邮箱', 
          trigger: 'blur'
          }, {
              validator: checkEmail, 
              trigger: 'blur'
              }
        ],
        mobile: [
          {
          required: true, 
          message:'请输入手机号', 
          trigger: 'blur'
          }, {
              validator: checkMobile, 
              trigger: 'blur'
              }
        ],
      },
      // 控制分配角色对话框的显示与隐藏
      assigningRolesdialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有的角色数据列表
      roleList: [],
      // 所选角色Id
      selectedRoleId: ''
    }
  },    //!data的结尾
  // !在实例创建完成后被立即调用  获取列表
  created() {
    this.getUserList()
  },  
  methods: {
    // 获取用户数据列表
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败！')
      }
      this.userlist = res.data.users
      this.total = res.data.total
      console.log(res)
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      // console.log(newSize);
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码值的改变
    handleCurrentChange(newPage) {
      // console.log(newPage);
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // swith开关状态的改变
    async userStateChange(userinfo) {
      console.log(userinfo);
      const {data: res} = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
        )
      if(res.meta.status !== 200){
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error("更新用户状态失败!")
      }
      this.$message.success("更新用户状态成功!")
    },
    // 监听添加用户对话框关闭的事件
    dialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    //点击按钮，添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => 
      {
        if(!valid) return
        // 可以发起添加用户的网络请求
        const {data: res} = await this.$http.post('users', this.addForm)
        if(res.meta.status !== 201) {
          this.$message.error("添加用户失败!")
        }
        this.$message.success("添加用户成功!") 
        // 隐藏添加用户的对话框
        this.addDialogVisible = false
        // 重新获取用户数据列表
        this.getUserList()
      })
    },
    // 显示或隐藏修改按钮的编辑框事件
    async showEditDialog(id) {
      // console.log(id);
      const {data: res} = await this.$http.get('users/' + id)

      if(res.meta.status !== 200) {
        return this.$message.error("查询用户信息失败")
      }
      
      this.editForm = res.data
      this.editDialogVisible = true;
    },
    // 监听编辑对话框关闭事件
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息并提交
    editNameInfo() {
      this.$refs.editFormRef.validate(async valid => {
        // console.log(valid);
        if(!valid) return
        // 发起修改用户信息的数据请求
        const {data: res} = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })  
        if(res.meta.status !== 200) {
          return this.$message.error("更新用户信息失败")
        }
        
        // 关闭修改对话框
        this.editDialogVisible = false
        // 重新刷新数据列表
        this.getUserList()
        // 提示用户更新成功
        this.$message.success("更新用户信息成功")
      })
    },
    // 根据ID删除对应的用户信息
    async removeUserById(id) {
      // 弹框询问是否删除数据
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?', 
        '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

        //如果用户确认删除,则返回值为字符串confirm
        // 如果用户取消了删除，则返回值为字符串cancel
        // console.log(confirmResult);
        if(confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }

        const {data: res} = await this.$http.delete('users/' + id)

        if(res.meta.status !== 200) {
          return this.$message.error("删除用户失败")
        }

        this.$message.success("删除用户成功")
        // 重新获取用户数据列表
        this.getUserList()
    },
    // 展示分配角色对话框事件
    async showRolesdialog(userInfo) {
      this.userInfo = userInfo

      // 在展示对话框之前，获取角色列表
      const {data: res} = await this.$http.get('roles')

      if(res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败")
      }
      // 将获取的角色列表保存
      this.roleList = res.data
      
      this.assigningRolesdialogVisible = true
    },
    // 点击确定按钮分配角色事件
    async saveRoleInfo() {
      // 如果当前没有选择要分配的角色ID
      if(!this.selectedRoleId) {
        return this.$message.error("请选择要分配的角色")
      }

      const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`, {rid: this.selectedRoleId})

      if(res.meta.status !== 200) {
        return this.$message.error("更新角色失败")
      }

      this.$message.success("更新角色成功")
      // 重新获取用户数据列表
      this.getUserList()
      // 隐藏分配角色对话框
      this.assigningRolesdialogVisible = false
    },
    // 监听分配角色对话框的关闭
    assignRoleDialogClosed() {
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  },
}//!methods的结尾
</script>

<style lang="less" scoped>

</style>