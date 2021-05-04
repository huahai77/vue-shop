<template>
  <div class="roles">
    <!-- /********面包屑导航********/ -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- /******卡片试图区域****** */ -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddRoleBox">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域  -->
      <el-table :data="rolesList" stripe border>
        <!-- 展开权限列 -->
        <el-table-column type="expand">
          <template v-slot:default="scope">
            <el-row v-for="(item1, index1) in scope.row.children" 
            :key="item1.id" 
            :class="['tagButton',index1 == 0 ? 'bagTop' : '','vcenter']">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeIdRights(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套显示二级权限 -->
                <el-row v-for="(item2,index2) in item1.children" 
                :key="item2.id" 
                :class="[index2 == 0 ? '' : 'bagTop','vcenter']" 
                @close="removeIdRights(scope.row, item3.id)">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeIdRights(scope.row, item2.id)"> {{item2.authName}} </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag type="danger" 
                    closable v-for="(item3,index3) in item2.children" 
                    :key="item3.id" 
                    @close="removeIdRights(scope.row, item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <!-- 操作按钮 -->
        <el-table-column label="操作">
          <template v-slot:default="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightsDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- ****分配权限对话框区域*** -->
    <el-dialog title="分配权限"  :visible.sync="setRightsVisille" width="50%" @close="setRightsDialogClose">
      <!-- 权限列表树形图区域 -->
      <el-tree :data="rightsList" :props="treeProps" show-checkbox default-expand-all node-key="id" :default-checked-keys="defKeys" ref="treeRef"></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsVisille = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- ------------------- -->
    <!-- /*添加角色对话框*/ -->
    <el-dialog title="添加角色" :visible.sync="addRoleVisible" width="50%">
      <!-- 内容主体区域 -->
      <el-form label-width="70px">
        <el-form-item label="用户名" prop="roleName">
          <el-input v-model="addRole.roleName"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="roleDesc">
          <el-input v-model="addRole.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoleVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //所有角色列表数据
      rolesList: [],
      // 所有权限列表数据
      rightsList: [],
      // 控制分配权限按钮的显示与隐藏
      setRightsVisille: false,
      // 树形图的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点id值
      defKeys: [],
      // 当前即将分配权限的id
      roleId: '',
      // 添加角色对话框
      addRoleVisible: false,
      addRole: {
        roleDesc: '',
        roleName: ''
      }
    }
  }, //data结束
  created() {
    //获取角色列表数据
    this.getRoleList()
  },
  methods: {
    // 获取所有角色的列表
    async getRoleList() {
      const { data: res } =await this.$http.get('roles')

      if(res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败")
      }

      this.rolesList = res.data
      console.log(this.rolesList)
    },
    // 根据Id删除对应的权限
    async removeIdRights(role, rightId) {
      // 弹框提示用户是否删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?', '提示', 
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)

        if(confirmResult !== 'confirm') {
          return this.$message.info('您取消了删除')
        }
        
        const {data: res} = await this.$http.delete(
          `roles/${role.id}/rights/${rightId}`
        )

        if(res.meta.status !== 200) {
          return this.$message.error("删除用户失败")
        }
        // 重新获取权限列表
        // this.getRoleList()
        role.children = res.data
    },
    // 点击展示分配权限对话框事件
    async showSetRightsDialog(role) {
      this.roleId = role.id
      // 获取所有权限的数据
      const {data: res} = await this.$http.get('rights/tree')
      
      if(res.meta.status !== 200) {
        return this.$message.error("获取权限列表失败")
      }
      
      // 递归获取三级节点
      this.getLeafKeys(role, this.defKeys)
      // 将获取到的权限保存到定义好的权限列表中
      this.rightsList = res.data

      this.setRightsVisille = true
    },
    // 根据递归的形式，获取角色下所有三级权限的id，并保存到defkey数组
    getLeafKeys(node, arr) {
      // 如果当前的node节点不包含children，说明是三级权限，就往arr里添加id
      if(!node.children) {
        return arr.push(node.id)
      }
      
      node.children.forEach(item => this.getLeafKeys(item,arr))
    },
    // 监听权限设置对话框的关闭
    setRightsDialogClose() {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]

      const idStr = keys.join(',')
      const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr})

      if(res.meta.status !== 200) {
        return this.$message.error("分配角色权限失败")
      }
      this.$message.success("分配角色权限成功")
      // 重新角色列表
      this.getRoleList()
      // 关闭对话框
      this.setRightsVisille = false
    },
    // 控制添加角色对话框的显示与隐藏
    showAddRoleBox() {
      this.addRoleVisible = true;
    },
  },  //methods结束
}
</script>

<style  lang="less" scoped>
.el-tag {
  margin: 7px;
}

.tagButton {
  border-bottom: 1px solid #eee;
}

.bagTop {
  border-top: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>