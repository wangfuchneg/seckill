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
      <h3 class="product-title">{{ selectedItem.title || '请选择商品' }}</h3>
      <p class="market-price" v-if="selectedItem.price">
        市场价：<del>¥{{ selectedItem.price }}</del>
      </p>
      <p class="seckill-price" v-if="selectedItem.promoItemPrice">
        秒杀价：¥{{ selectedItem.promoItemPrice }}
      </p>
      <p class="sales" v-if="selectedItem.sales !== undefined">
        销量：已售{{ selectedItem.sales || 0 }}件
      </p>
      <div class="buy-section" v-if="selectedItem.stock !== undefined">
        <label for="buyQuantity">购买数量：</label>
        <input
            type="number"
            id="buyQuantity"
            v-model.number="buyQuantity"
            :min="1"
            :max="selectedItem.stock"
            :disabled="!canBuy"
        />
        <span>(库存：{{ selectedItem.stock || 0 }})</span>
      </div>
      <button
          class="seckill-btn"
          :disabled="!canBuy || isSubmitting"
          @click="showOrderConfirm = true"
          v-if="selectedItem.id"
      >
        <span v-if="isSubmitting">提交中...</span>
        <span v-else>立即秒杀</span>
      </button>

      <!-- 订单确认弹窗 -->
      <div v-if="showOrderConfirm" class="order-confirm-modal">
        <div class="modal-content">
          <h3>订单确认</h3>
          <p>商品：{{ selectedItem.title }}</p>
          <p>秒杀价：¥{{ selectedItem.promoItemPrice }}</p>
          <p>数量：{{ buyQuantity }}</p>
          <p>总价：¥{{ (selectedItem.promoItemPrice * buyQuantity).toFixed(2) }}</p>
          <div class="modal-buttons">
            <button @click="submitOrder">确认下单</button>
            <button @click="showOrderConfirm = false">取消</button>
          </div>
        </div>
      </div>

      <!-- 下单成功弹窗 -->
      <div v-if="showOrderSuccess" class="order-success-modal">
        <div class="modal-content">
          <h3>结算成功</h3>
          <p>您的订单已创建</p>
          <p>订单号：{{ orderNo || '系统生成中' }}</p>
          <button @click="showOrderSuccess = false">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

// 允许跨域携带cookie
axios.defaults.withCredentials = true;

export default {
  name: 'SeckillPage',
  data() {
    return {
      currentCategory: '首页',
      item: [], // 畅销商品列表
      countdownTick: 0, // 倒计时触发变量
      selectedItem: {
        id: '',
        title: '',
        imgUrl: '',
        price: '',
        description: '',
        startDate: '',
        endDate: '',
        promoItemPrice: '',
        stock: 0,
        sales: 0,
        promoName: ''
      }, // 当前选中的商品
      buyQuantity: 1, // 购买数量
      enlargeImage: false, // 是否显示放大图片
      showOrderConfirm: false, // 订单确认弹窗
      showOrderSuccess: false, // 结算成功弹窗
      orderNo: '', // 订单号
      startTimer: null, // 倒计时定时器
      isSubmitting: false, // 下单加载状态
      // 新增：错误提示相关
      errorMessage: '',
      showError: false
    };
  },
  computed: {
    // 判断是否在促销时间内
    isInPromoTime() {
      if (!this.selectedItem.startDate || !this.selectedItem.endDate) return false;

      // 处理日期格式，确保与后端返回格式兼容
      const now = new Date();
      const start = new Date(this.selectedItem.startDate);
      const end = new Date(this.selectedItem.endDate);

      // 检查日期是否有效
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.error('无效的日期格式:', this.selectedItem.startDate, this.selectedItem.endDate);
        return false;
      }

      return now >= start && now <= end;
    },
    // 是否可购买（促销期+库存>0+有选中商品）
    canBuy() {
      return this.isInPromoTime &&
          this.selectedItem.stock > 0 &&
          Object.keys(this.selectedItem).length > 0;
    },
    // 秒杀开始倒计时文本
    startCountdownText() {
      this.countdownTick; // 依赖触发
      if (!this.selectedItem.startDate) return '';

      const now = new Date();
      const start = new Date(this.selectedItem.startDate);

      if (isNaN(start.getTime())) {
        return '日期格式错误';
      }

      if (now >= start) return '已开始';

      const diff = start - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return `${days}天${hours}时${minutes}分${seconds}秒`;
    },
    // 秒杀结束倒计时文本
    endCountdownText() {
      this.countdownTick; // 依赖触发
      if (!this.selectedItem.endDate) return '';

      const now = new Date();
      const endDate = new Date(this.selectedItem.endDate);

      if (isNaN(endDate.getTime())) {
        return '日期格式错误';
      }

      if (now > endDate) return '已结束';

      const diff = endDate - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return `${days}天${hours}时${minutes}分${seconds}秒`;
    },
  },
  mounted() {
    // 初始化请求商品数据
    this.fetchItem();
  },
  methods: {
    // 切换分类
    changeCategory(category) {
      this.currentCategory = category;
      this.fetchItem(); // 重新请求对应分类商品
    },

    // 从后端获取分类商品列表
    fetchItem() {
      axios.get('http://localhost:8082/showPromos')
          .then((response) => {
            const promoList = response.data || [];
            // 若没有促销数据，直接返回
            if (promoList.length === 0) {
              this.item = [];
              return;
            }
            // 批量请求每个促销对应的商品详情
            Promise.all(
                promoList.map(promo =>
                    this.fetchProductDetail(promo.itemId) // 复用现有fetchProductDetail方法
                        .then(res => ({
                          // 合并促销信息和商品信息
                          promoId: promo.id,
                          promoName: promo.promoName,
                          startDate: promo.startDate,
                          endDate: promo.endDate,
                          promoItemPrice: promo.promoItemPrice,
                          // 商品详情字段（从/item/detail接口返回的res.data中获取）
                          id: res.data.id,
                          title: res.data.title,
                          imgUrl: res.data.imgUrl,
                          price: res.data.price,
                          stock: res.data.stock, // 提前获取库存，减少后续请求（可选）
                          sales: res.data.sales  // 提前获取销量（可选）
                        }))
                )
            ).then(mergedList => {
              this.item = mergedList; // 合并后的数据用于渲染左侧列表
              if (this.item.length > 0) {
                this.selectItem(this.item[0]);
              }
            });
          })
          .catch((error) => {
            console.error(`获取「${this.currentCategory}」商品失败：`, error);
            this.item = [];
            this.selectedItem = {};
            this.resetTimers();
            this.showError = true;
            this.errorMessage = `加载${this.currentCategory}商品列表失败，请刷新页面重试`;
            // 3秒后自动隐藏错误提示
            setTimeout(() => this.showError = false, 3000);
          });
    },

    // 选中商品（加载详情+启动定时器）
    selectItem(product) {
      this.resetTimers();
      // 若product中已包含stock、sales等详情字段，直接赋值（无需再请求）
      if (product.stock !== undefined && product.sales !== undefined) {
        this.selectedItem = product;
        this.startTimers();
        this.buyQuantity = 1;
        return;
      }
      this.fetchProductDetail(product.id)
          .then((response) => {
            // 适配后端ItemDetailDTO的数据结构
            this.selectedItem = {
              id: response.data.id,
              title: response.data.title,
              imgUrl: response.data.imgUrl,
              price: response.data.price,
              description: response.data.description,
              startDate: response.data.startDate,
              endDate: response.data.endDate,
              promoItemPrice: response.data.promoItemPrice,
              stock: response.data.stock || 0,
              sales: response.data.sales || 0,
              promoName: response.data.promoName
            };
            this.startTimers(); // 启动倒计时
            this.buyQuantity = 1; // 重置购买数量
          })
          .catch((error) => {
            console.error('获取商品详情失败：', error);
            this.selectedItem = { ...product }; // 失败时用列表数据兜底
            this.showError = true;
            this.errorMessage = '加载商品详情失败，将使用基础信息';
            setTimeout(() => this.showError = false, 3000);
          });
    },

    // 获取商品详情（库存、销量等）
    fetchProductDetail(itemId) {
      return axios.get(`http://localhost:8082/item/detail/${itemId}`)
          .then((response) => {
            return response;
          })
          .catch((error) => {
            console.error('商品详情请求失败：', error);
            throw error;
          });
    },

    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return '';
      const timestamp = new Date(dateTime).getTime();
      if (isNaN(timestamp)) return '';

      const date = new Date(timestamp);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    },

    // 启动倒计时定时器
    startTimers() {
      this.resetTimers(); // 先清旧定时器
      this.startTimer = setInterval(() => {
        this.countdownTick++;
        // 每秒钟检查一次是否在促销时间内，如果状态变化则更新按钮状态
        if (this.canBuy) {
          this.$forceUpdate();
        }
      }, 1000);
    },

    // 清除定时器（防止内存泄漏）
    resetTimers() {
      if (this.startTimer) {
        clearInterval(this.startTimer);
        this.startTimer = null;
      }
      this.countdownTick = 0;
    },

    // 提交订单（核心逻辑）
    submitOrder() {
      // 前置校验
      if (!this.selectedItem.id) {
        alert('请先选择商品');
        this.showOrderConfirm = false;
        return;
      }
      if (this.buyQuantity < 1 || this.buyQuantity > this.selectedItem.stock) {
        alert(`购买数量无效，请输入1-${this.selectedItem.stock}之间的数值`);
        return;
      }

      this.isSubmitting = true;
      // 构造订单数据（匹配后端接口要求）
      const orderData = {
        userId: localStorage.getItem('userId') || 1, // 登录用户ID（默认1测试）
        itemId: this.selectedItem.id,
        count: this.buyQuantity,
        price: this.selectedItem.promoItemPrice, // 秒杀价作为订单单价
        orderPrice: (this.selectedItem.promoItemPrice * this.buyQuantity).toFixed(2) // 订单总价
      };

      // 调用订单服务创建订单
      axios.post('http://localhost:8083/createOrder', orderData)
          .then((response) => {
            this.orderNo = response.data.orderNo; // 接收后端返回的订单号
            this.showOrderConfirm = false;
            this.showOrderSuccess = true; // 显示结算成功弹窗
            // 刷新商品库存/销量
            this.fetchProductDetail(this.selectedItem.id);
          })
          .catch((error) => {
            console.error('下单失败：', error);
            const errMsg = error.response?.data?.message || '下单失败，请重试';
            this.showError = true;
            this.errorMessage = errMsg;
            setTimeout(() => this.showError = false, 3000);
          })
          .finally(() => {
            this.isSubmitting = false; // 无论成败，关闭加载状态
          });
    },
  },
  // 组件销毁前清除定时器
  beforeUnmount() {
    this.resetTimers();
  }
};
</script>

<style scoped>
/* 导航栏样式 */
.nav-header {
  background-color: #ff4400;
  color: #fff;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.category-bar {
  display: flex;
  align-items: center;
}

.category-bar h2 {
  font-size: 20px;
  margin-right: 20px;
  margin: 0;
}

.category-list {
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
}

.category-item {
  margin-right: 25px;
  cursor: pointer;
  font-size: 16px;
  padding: 5px 0;
  position: relative;
}

.category-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #fff;
  border-radius: 1px;
}

.other-links a {
  color: #fff;
  text-decoration: none;
  margin-left: 15px;
  font-size: 16px;
}

.other-links a:hover {
  text-decoration: underline;
}

/* 错误提示 */
.error-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #f44336;
  color: white;
  padding: 15px;
  border-radius: 4px;
  z-index: 1001;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  animation: fadein 0.5s, fadeout 0.5s 2.5s;
}

@keyframes fadein {
  from {top: 0; opacity: 0;}
  to {top: 20px; opacity: 1;}
}

@keyframes fadeout {
  from {top: 20px; opacity: 1;}
  to {top: 0; opacity: 0;}
}

/* 商品展示容器 */
.product-display-container {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
  box-sizing: border-box;
}

/* 左侧畅销商品栏 */
.left-column {
  width: 20%;
  border-right: 1px solid #eee;
  padding-right: 20px;
  height: calc(100vh - 120px);
  overflow-y: auto;
  position: sticky;
  top: 20px;
  box-sizing: border-box;
}

.left-column h2 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #333;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.hot-products {
  list-style: none;
  padding: 0;
  margin: 0;
}

.left-column::-webkit-scrollbar {
  width: 6px;
}

.left-column::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 3px;
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

.hot-products li:hover, .hot-products li.active {
  border-color: #ff4400;
  background-color: #fff0e8;
}

.product-thumb {
  width: 80px;
  height: 80px;
  object-fit: cover;
  margin-right: 10px;
  border-radius: 4px;
  border: 1px solid #eee;
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
  color: #e53935;
  margin: 0;
  font-weight: bold;
}

/* 中间商品主图栏 */
.middle-column {
  width: 45%;
  border: 1px solid #eee;
  padding: 20px;
  border-radius: 4px;
  position: relative;
  background-color: #fff;
  box-sizing: border-box;
}

.main-product-image {
  width: 100%;
  height: auto;
  cursor: zoom-in;
  border-radius: 4px;
}

/* 图片放大弹窗 */
.enlarge-modal-middle {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.enlarge-modal-content {
  max-width: 90%;
  max-height: 90%;
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
}

.enlarge-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* 右侧商品信息栏 */
.right-column {
  width: 30%;
  padding: 20px;
  box-sizing: border-box;
}

.seckill-start-time, .seckill-countdown {
  color: #e53935;
  font-size: 14px;
  margin: 8px 0;
}

.product-title {
  font-size: 18px;
  color: #333;
  margin: 15px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.market-price {
  font-size: 14px;
  color: #999;
  margin: 8px 0;
}

.seckill-price {
  font-size: 22px;
  color: #e53935;
  font-weight: bold;
  margin: 10px 0;
}

.sales {
  font-size: 14px;
  color: #666;
  margin: 8px 0 20px;
}

.buy-section {
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.buy-section label {
  font-size: 14px;
  color: #333;
}

.buy-section input {
  width: 60px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
}

.buy-section input:disabled {
  background-color: #f8f8f8;
  cursor: not-allowed;
}

.seckill-btn {
  width: 100%;
  padding: 14px;
  background-color: #e53935;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
}

.seckill-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.8;
}

.seckill-btn:hover:not(:disabled) {
  background-color: #c62828;
}

/* 订单确认/成功弹窗 */
.order-confirm-modal, .order-success-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.modal-content p {
  margin: 12px 0;
  color: #666;
  font-size: 14px;
}

.modal-buttons {
  display: flex;
  gap: 15px;
  margin-top: 25px;
}

.modal-buttons button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.modal-buttons button:first-child {
  background-color: #e53935;
  color: #fff;
}

.modal-buttons button:last-child {
  background-color: #eee;
  color: #333;
}

.order-success-modal button {
  width: 100%;
  padding: 12px;
  background-color: #e53935;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
}

/* 响应式适配 */
@media (max-width: 1024px) {
  .product-display-container {
    flex-direction: column;
  }

  .left-column, .middle-column, .right-column {
    width: 100%;
    border-right: none;
    height: auto;
    position: static;
    margin-bottom: 20px;
  }

  .middle-column {
    order: -1;
  }
}
</style>
