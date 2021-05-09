<template>
  <div class="order">
    <!-- /********面包屑导航********/ -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- /*****卡片试图区域******/ -->
    <el-card>
      <!-- 搜索框 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- table表格区域 -->
      <el-table :data="ordersList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template v-slot="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货">
          <template v-slot="scope">
            <template>
              {{scope.row.is_send}}
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template v-slot="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <!--             修改地址 -->
            <el-tooltip effect="dark" content="修改地址" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showAddressDialog"></el-button>
            </el-tooltip>
            <!--             物流状态 -->
            <el-tooltip effect="dark" content="物流状态" placement="top" :enterable="false">
              <el-button type="success" icon="el-icon-location-outline" size="mini" @click="showLogisticsDialog"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- /*****底部分页*****/ -->
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

    <!-- 修改地址对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressVisible"
      width="50%" 
      @close="addressDialogClosed">
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="addressForm.address1"
            :options="cityData" 
            :props="{ expandTrigger: 'hover' }">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 物流状态对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressVisible"
      width="50%" 
      @close="progressDialogClosed">
      <el-timeline :reverse="reverse">
        <el-timeline-item
          v-for="(activity, index) in activities"
          :key="index"
          :timestamp="activity.timestamp">
          {{activity.content}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>


  </div>
</template>

<script>
import cityData from './citydata.js'

export default {
  data() {
    return {
      queryInfo: {
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 10,
      },
      // 总数据条数
      total: 0,
      // 订单列表
      ordersList: [],
      // 修改对话框的显示状态
      addressVisible: false,
      // 订单的表单数据对象
      addressForm: {
        address1: [],
        address2: ''
      },
      // 订单数据的验证规则
      addressFormRules: {
        address1: [
          {required: true, message:'请选择省市区/县', trigger: 'blur'}
        ],
        address2: [
          {required: true, message:'请输入详细地址', trigger: 'blur'}
        ]
      },
      cityData,
      // 物流进度对话框的显示状态
      progressVisible: false,
      // 物流进度显示的倒序设置
      reverse: false,
      // 进度列表
      activities: [{
          content: '已签收,您的快递已到达【泸州职业技术学院】感谢您使用顺丰快递,期待再次为您服务！',
          timestamp: '2018-05-10 09:39:00'
        }, {
          content: '您的订单由【泸州分拣中心】送往【泸州职业技术学院】',
          timestamp: '2018-05-10 07:32:00'
        }, {
          content: '快件到达 【泸州分拣中心】',
          timestamp: '2018-05-10 07:32:00'
        }, {
          content: '快件在【成都新都分拣中心】已装车,准备发往 【泸州分拣中心】',
          timestamp: '2018-05-10 07:32:00'
        }, {
          content: '快件到达 【北京顺义集散中心】',
          timestamp: '2018-05-09 23:05:00'
        }, {
          content: '顺丰速运 已收取快件',
          timestamp: '2018-05-09 13:07:00'
        }, {
          content: '卖家发货',
          timestamp: '2018-05-08 22:36:04'
        }, {
          content: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
          timestamp: '2018-05-08 21:55:04'
        }, {
          content: '商品已经下单',
          timestamp: '2018-05-08 21:36:04'
        }
      ],
    }
  },
  created() {
    this.getOrdersList()
  },
  methods: {
    // 获取订单数据列表
    async getOrdersList() {
      const { data: res } = await this.$http.get('orders', {params: this.queryInfo}) 
      if(res.meta.status !== 200) {
        return this.$message.error("获取订单列表失败")
      }
      console.log(res)
      this.total = res.data.total
      this.ordersList = res.data.goods
    },
    // 每页显示条数发生变化触发该函数
    handleSizeChange(newPageSize) {
      this.queryInfo.pagesize = newPageSize
      this.getOrdersList()
    },
    // 页码值发生变化触发该函数
    handleCurrentChange(newPageNum) {
      this.queryInfo.pagenum = newPageNum
      this.getOrdersList()
    },
    // 控制显示修改地址对话框
    showAddressDialog() {
      this.addressVisible = true
    },
    // 监听修改地址对话框的关闭
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields()
    },
    // 控制显示物流状态的对话框
    showLogisticsDialog() {
      // const {data: res} = await this.$http.get('/kuaidi/1106975712662')

      // if(res.meta.status !== 200) {
      //   return this.$message.error("获取物流信息失败")
      // }
      // this.progressInfo = res.data

      this.progressVisible = true
      // console.log(this.progressInfo)
      
    },
    // 监听物流进度对话框的关闭
    progressDialogClosed() {}

  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}

</style>