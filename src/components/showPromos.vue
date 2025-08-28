<template>
  <div class="nav-header">
    <div class="category-bar">
      <h2>全部商品分类</h2>
      <ul class="category-list">
        <li
            class="category-item"
            :class="{ active: currentCategory === '首页' }"
            @click="changeCategory('首页')"
        >
          首页
        </li>
        <li
            class="category-item"
            :class="{ active: currentCategory === '手机' }"
            @click="changeCategory('手机')"
        >
          手机
        </li>
        <li
            class="category-item"
            :class="{ active: currentCategory === '图书' }"
            @click="changeCategory('图书')"
        >
          图书
        </li>
        <li
            class="category-item"
            :class="{ active: currentCategory === '男装' }"
            @click="changeCategory('男装')"
        >
          男装
        </li>
        <li
            class="category-item"
            :class="{ active: currentCategory === '女装' }"
            @click="changeCategory('女装')"
        >
          女装
        </li>
        <li
            class="category-item"
            :class="{ active: currentCategory === '电子数码' }"
            @click="changeCategory('电子数码')"
        >
          电子数码
        </li>
        <li
            class="category-item"
            :class="{ active: currentCategory === '美食吃喝' }"
            @click="changeCategory('美食吃喝')"
        >
          美食吃喝
        </li>
      </ul>
    </div>
    <div class="other-links">
      <a href="#">促销活动</a>
      <a href="#">积分商城</a>
    </div>
  </div>
  <div class="product-display-container">
    <!-- 左侧畅销商品栏 -->
    <div class="left-column">
      <h2>畅销商品</h2>
      <ul class="hot-products">
        <li
            v-for="product in item"
            :key="product.id"
            @click="selectItem(product)"
            :class="{ active: selectedItem.id === product.id }"
        >
          <!-- 直接使用后端返回的 imgUrl -->
          <img :src="product.imgUrl" alt="商品缩略图" class="product-thumb" />
          <div class="product-info">
            <p class="product-name">{{ product.title }}</p>
            <p class="product-price">¥{{ product.price }}</p>
          </div>
        </li>
      </ul>
    </div>

    <!-- 中间内容栏 -->
    <div class="middle-column">
      <!-- 直接使用后端返回的 imgUrl -->
      <img
          v-if="selectedItem.imgUrl"
          :src="selectedItem.imgUrl"
          alt="商品主图"
          class="main-product-image"
          @click="enlargeImage = true"
      />
      <div v-if="enlargeImage" class="enlarge-modal-middle">
        <div class="enlarge-modal-content" @click.stop="enlargeImage = false">
          <img :src="selectedItem.imgUrl" alt="放大商品图" class="enlarge-image" />
        </div>
      </div>
    </div>

    <!-- 右侧信息栏 -->
    <div class="right-column">
      <p class="seckill-start-time" v-if="selectedItem.startDate">
        秒杀开始时间：{{ formatDateTime(selectedItem.startDate) }}
      </p>
      <p class="seckill-countdown" v-if="selectedItem.startDate">
        秒杀开始倒计时：{{ startCountdownText }}
      </p>
      <p class="seckill-countdown" v-if="selectedItem.endDate">
        秒杀结束倒计时：{{ endCountdownText }}
      </p>
      <h3 class="product-title">{{ selectedItem.title }}</h3>
      <p class="market-price">
        市场价：<del>¥{{ selectedItem.price }}</del>
      </p>
      <p class="seckill-price">秒杀价：¥{{ selectedItem.promoItemPrice }}</p>
      <p class="sales">销量：已售{{ selectedItem.sales || 0 }}件</p>
      <div class="buy-section">
        <label for="buyQuantity">购买数量：</label>
        <input
            type="number"
            id="buyQuantity"
            v-model.number="buyQuantity"
            :min="1"
            :max="selectedItem.stock"
        />
        <span>(库存：{{ selectedItem.stock || 0 }})</span>
      </div>
      <button
          class="seckill-btn"
          :disabled="!canBuy"
          @click="showOrderConfirm = true"
      >
        立即秒杀
      </button>

      <!-- 订单确认弹窗 -->
      <div v-if="showOrderConfirm" class="order-confirm-modal">
        <h3>订单确认</h3>
        <p>商品：{{ selectedItem.title }}</p>
        <p>价格：¥{{ selectedItem.promoItemPrice }}</p>
        <p>数量：{{ buyQuantity }}</p>
        <p>总价：¥{{ (selectedItem.promoItemPrice * buyQuantity).toFixed(2) }}</p>
        <div class="modal-buttons">
          <button @click="submitOrder">确认下单</button>
          <button @click="showOrderConfirm = false">取消</button>
        </div>
      </div>

      <!-- 下单成功弹窗 -->
      <div v-if="showOrderSuccess" class="order-success-modal">
        <h3>下单成功</h3>
        <p>订单号：{{ orderNo }}</p>
        <button @click="showOrderSuccess = false">确定</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

// 允许跨域携带cookie
axios.defaults.withCredentials = true;

export default {
  data() {
    return {
      currentCategory: '首页',
      item: [], // 畅销商品列表
      countdownTick: 0, // 实现倒计时的动态变化
      selectedItem: {
        id: '',
        title: '',
        imgUrl: '',
        price: '',
        description: '',
        promoName: '',
        startDate: '',
        endDate: '',
        promoItemPrice: '',
        stock:0,
        sales: 0,

      }, // 当前选中的商品
      buyQuantity: 1, // 购买数量
      enlargeImage: false, // 是否显示放大图片
      showOrderConfirm: false, // 订单确认弹窗
      showOrderSuccess: false, // 下单成功弹窗
      orderNo: '', // 订单号
      startTimer: null, // 开始倒计时定时器
      endTimer: null, // 结束倒计时定时器
    };
  },
  computed: {
    // 判断是否在促销时间内
    isInPromoTime() {
      if (!this.selectedItem.startDate || !this.selectedItem.endDate) return false;
      const now = new Date();
      const start = new Date(this.selectedItem.startDate);
      const end = new Date(this.selectedItem.endDate);
      return now >= start && now <= end;
    },
    // 当前价格（促销期用促销价，否则用原价）
    currentPrice() {
      return this.isInPromoTime ? this.selectedItem.promoItemPrice : this.selectedItem.price;
    },
    // 是否可购买（库存>0）
    canBuy() {
      return this.selectedItem.stock > 0;
    },
    // 秒杀开始倒计时文本
    startCountdownText() {
      this.countdownTick; // 依赖触发变量
      if (!this.selectedItem.startDate) return '';
      const now = new Date();
      const start = new Date(this.selectedItem.startDate);

      if (now >= start) return '已开始';

      // 计算距离开始的时间差
      const diff = start- now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return `${days}天${hours}时${minutes}分${seconds}秒`;
    },
    // 秒杀结束倒计时文本
    endCountdownText() {
      this.countdownTick; // 依赖触发变量
      if (!this.selectedItem.endDate) return '';
      const now = new Date();
      const endDate = new Date(this.selectedItem.endDate);

      if (now > endDate) return '已结束';

      // 计算距离结束的时间差
      const diff = endDate - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return `${days}天${hours}时${minutes}分${seconds}秒`;
    },
  },
  mounted() {
    // 初始化时请求商品数据
    this.fetchItem();
  },
  methods: {
    changeCategory(category) {
      this.currentCategory = category;
      // 分类切换时重新请求对应分类的商品
      this.fetchItem();
    },

    // 从后端获取畅销商品列表
    fetchItem() {
      axios.get('http://localhost:8082/showPromos')
          .then((response) => {
            console.log('商品详情接口返回：', response.data); // 新增打印
            this.item = response.data;
            // 初始化选中第一个商品
            if (this.item.length > 0) {
              this.selectItem(this.item[0]);
            }
          })
          .catch((error) => {
            console.error('获取畅销商品失败：', error);
            alert('加载商品列表失败，请刷新页面重试');
          });
    },

    // 选中商品
    selectItem(item) {
      this.selectedItem = { ...item };
      // 获取商品详情（包含库存、销量等）
      this.fetchProductDetail(item.id)
          .then(() => {
            // 确保详情加载后重启定时器
            this.resetTimers();
            this.startTimers();
          });
    },

    // 从后端获取商品详情
    fetchProductDetail(itemId) {
      return axios.get(`http://localhost:8082/item/detail/${itemId}`)
          .then((response) => {
            console.log('后端测试库存：', response.data.stock); // 验证是否有值
            this.selectedItem = { ...this.selectedItem, ...response.data };
            // 重置并启动倒计时
            this.resetTimers();
            this.startTimers();
            return response;
          })
          .catch((error) => {
            console.error('获取商品详情失败：', error);
            throw error;
          });
    },

    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return '';
      const date = new Date(dateTime);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    },

    // 启动倒计时定时器
    startTimers() {
      // 每秒更新一次倒计时
      this.startTimer = setInterval(() => {
        this.countdownTick++; // 每秒更新触发
      }, 1000);

      this.endTimer = setInterval(() => {
        this.$forceUpdate();
      }, 1000);
    },


    // 清除倒计时定时器
    resetTimers() {
      clearInterval(this.startTimer);
      clearInterval(this.endTimer);
      this.countdownTick = 0; // 重置触发
    },

    // 提交订单
    submitOrder() {
      const orderData = {
        itemId: this.selectedItem.id,
        count: this.buyQuantity,
        price: this.currentPrice,
      };

      axios.post('/order/create', orderData)
          .then((response) => {
            this.orderNo = response.data.orderNo;
            this.showOrderConfirm = false;
            this.showOrderSuccess = true;
            // 刷新商品信息（重新获取最新库存和销量）
            this.fetchProductDetail(this.selectedItem.id);
          })
          .catch((error) => {
            console.error('下单失败：', error);
            alert(error.response?.data?.message || '下单失败，请重试');
          });
    },
  },
  beforeUnmount() {
    // 组件销毁前清除定时器
    this.resetTimers();
  },
};
</script>

<style scoped>
.nav-header {
  background-color: #ff4400;
  color: #fff;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-bar {
  display: flex;
  align-items: center;
}

.category-bar h2 {
  font-size: 20px;
  margin-right: 20px;
}

.category-list {
  list-style: none;
  display: flex;
  margin: 0;
  padding-left: 220px;
}

.category-item {
  margin-right: 20px;
  cursor: pointer;
  font-size: 18px;
}

.category-item.active {
  font-weight: bold;
}

.other-links a {
  color: #fff;
  text-decoration: none;
  margin-left: 15px;
  font-size: 18px;
}

.other-links a:hover {
  text-decoration: underline;
}

.product-display-container {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  gap: 20px;
}

.left-column {
  width: 20%;
  border-right: 1px solid #ddd;
  padding-right: 20px;
  /* 关键：给左侧容器设置固定高度，超出部分纵向滚动 */
  height: calc(100vh - 80px); /* 减去导航栏高度，可根据实际调整 */
  overflow-y: auto; /* 开启纵向滚动 */
  position: sticky; /* 可选：让左侧在滚动时固定，保持布局 */
  top: 80px; /* 配合 sticky，与导航栏高度对应 */
}

.hot-products {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* 可选：优化滚动条样式（适配 Chrome、Edge 等） */
.left-column::-webkit-scrollbar {
  width: 6px;
}

.left-column::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 3px;
}

.left-column::-webkit-scrollbar-track {
  background-color: #f8f8f8;
}

h2 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #333;
}

.hot-products li {
  margin-bottom: 15px;
  cursor: pointer;
  padding: 10px;
  border: 1px solid #fff;
  border-radius: 4px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
}

.hot-products li:hover {
  border-color: #ff4400;
  background-color: #fff8f5;
}

.hot-products li.active {
  border-color: #ff4400;
  background-color: #fff0e8;
}

.product-thumb {
  width: 80px;
  height: 80px;
  object-fit: cover;
  margin-right: 10px;
  border-radius: 4px;
}

.product-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.product-name {
  font-size: 14px;
  margin: 0 0 5px 0;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  font-size: 14px;
  color: #f00;
  margin: 0;
  font-weight: bold;
}


/* 中间栏样式，需设置为相对定位，作为弹窗的参考 */
.middle-column {
  width: 50%; /* 可根据实际需求调整宽度 */
  border: 1px solid #ddd;
  padding: 20px;
  position: relative; /* 关键：让子元素绝对定位相对于中间栏 */
  overflow: hidden; /* 避免弹窗超出中间栏后影响其他区域 */
}

/* 放大图片弹窗容器（覆盖中间栏） */
.enlarge-modal-middle {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明背景 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999; /* 确保在中间栏内容最上层 */
}

/* 弹窗内容，限制在中间栏内 */
.enlarge-modal-content {
  max-width: 100%;
  max-height: 100%;
}

.enlarge-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* 原商品主图样式可保持或调整 */
.main-product-image {
  width: 100%;
  height: auto;
  cursor: zoom-in;
}


</style>