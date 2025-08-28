<template>
  <div class="container">
    <h1>商品信息管理</h1>
    <form @submit.prevent="handleSubmit">
      <div class="form-group row">
        <label for="promoName" class="bold-label col-label">促销活动名称</label>
        <input type="text" id="promoName" v-model="formData.promoName" class="col-input" placeholder="请输入促销活动名称" />
      </div>
      <div class="form-group">
        <label class="bold-label">主图</label>
        <input type="file" @change="handleImageUpload" accept="image/*" />
        <img v-if="imgUrl" :src="imgUrl" alt="商品主图" style="max-width: 100px; max-height: 100px; margin-top: 10px;" />
      </div>

      <div class="form-group row">
        <label for="price" class="bold-label col-label">定价</label>
        <input type="number" id="price" v-model.number="formData.price" step="0.01" required class="col-input" />
      </div>

      <div class="form-group row">
        <label for="promoItemPrice" class="bold-label col-label">现价</label>
        <input type="number" id="promoItemPrice" v-model.number="formData.promoItemPrice" step="0.01" required class="col-input" />
      </div>

      <div class="form-group row">
        <label for="stock" class="bold-label col-label">库存</label>
        <input type="number" id="stock" v-model.number="formData.stock" required class="col-input" />
      </div>

      <div class="form-group row">
        <label for="sales" class="bold-label col-label">销量</label>
        <input type="number" id="sales" v-model.number="formData.sales" required class="col-input" />
      </div>

      <div class="form-group row">
        <label class="bold-label col-label">是否新品</label>
        <select v-model="formData.isNew" class="col-input">
          <option value="是">是</option>
          <option value="否">否</option>
        </select>
      </div>

      <div class="form-group row">
        <label class="bold-label col-label">是否特价</label>
        <select v-model="formData.isSpecial" class="col-input">
          <option value="是">是</option>
          <option value="否">否</option>
        </select>
      </div>

      <div class="form-group row">
        <label class="bold-label col-label">是否秒杀</label>
        <select v-model="formData.isSeckill" class="col-input">
          <option value="是">是</option>
          <option value="否">否</option>
        </select>
      </div>

      <!-- 秒杀开始时间 拆分 -->
      <div class="form-group row" v-if="formData.isSeckill === '是'">
        <label class="bold-label col-label">秒杀开始日期</label>
        <input type="date" v-model="formData.Date1" required class="col-input" />
      </div>
      <div class="form-group row" v-if="formData.isSeckill === '是'">
        <label class="bold-label col-label">秒杀开始时间（时分秒）</label>
        <input type="time" step="1" v-model="formData.startTime" required class="col-input" />
      </div>

      <!-- 秒杀结束时间 拆分（同理） -->
      <div class="form-group row" v-if="formData.isSeckill === '是'">
        <label class="bold-label col-label">秒杀结束日期</label>
        <input type="date" v-model="formData.Date2" required class="col-input" />
      </div>
      <div class="form-group row" v-if="formData.isSeckill === '是'">
        <label class="bold-label col-label">秒杀结束时间（时分秒）</label>
        <input type="time" step="1" v-model="formData.endTime" required class="col-input" />
      </div>

      <div class="form-group row">
        <label for="points" class="bold-label col-label">送积分</label>
        <input type="number" id="points" v-model.number="formData.points" class="col-input" />
      </div>

      <div class="form-group row">
        <label for="title" class="bold-label col-label">页面标题</label>
        <input type="text" id="title" v-model="formData.title" class="col-input" />
      </div>

      <div class="form-group row">
        <label for="description" class="bold-label col-label">页面描述</label>
        <textarea id="description" v-model="formData.description" rows="3" class="col-input"></textarea>
      </div>

      <div class="form-group row">
        <label for="pageKeywords" class="bold-label col-label">页面关键字</label>
        <input type="text" id="pageKeywords" v-model="formData.pageKeywords" class="col-input" />
      </div>

      <button type="submit" :disabled="isSubmitting">
        <span v-if="isSubmitting">提交中...</span>
        <span v-else>提交商品信息</span>
      </button>
      <div id="message" :class="{ success, error }">{{ message }}</div>
    </form>
  </div>
</template>

<script>
import axios from "axios";



export default {
  data() {
    return {

      formData: {
        price: 35.00,
        promoItemPrice: 30.00,
        stock: 9983,
        sales: 0,
        isNew: "是",
        isSpecial: "是",
        isSeckill: "是",
        Date1: "2025-08-20",
        startTime: "20:30:30", // 支持秒
        Date2: "2025-08-20",
        endTime: "22:30:30",
        points: 0,
        promoName: "",
        title: "",
        description: "",
        pageKeywords: "",

      },

      imgUrl: "",
      selectedFile: null, // 存储选中的图片文件
      message: "",
      success: false,
      error: false,
      isSubmitting: false,
    };

  },

  methods: {

    handleImageUpload(e) {
      const file = e.target.files[0];
      if (file) {
        // 验证文件类型
        if (!file.type.startsWith('image/')) {
          this.showMessage('请上传图片文件', 'error');
          return;
        }

        // 验证文件大小（限制10MB）
        if (file.size > 20 * 1024 * 1024) {
          this.showMessage('图片大小不能超过20MB', 'error');
          return;
        }

        this.selectedFile = file;
        // 生成本地预览URL
        this.imgUrl = URL.createObjectURL(file);
      }
    },





    showMessage(text, type) {
      this.message = text;
      this.success = type === 'success';
      this.error = type === 'error';

      // 3秒后自动清除消息
      setTimeout(() => {
        this.message = '';
        this.success = false;
        this.error = false;
      }, 3000);
    },



    async handleSubmit() {

      // 验证图片是否已上传
      if (!this.selectedFile) {
        this.showMessage('请上传商品主图', 'error');
        return;
      }

      // 验证表单必填项
      if (!this.formData.price || !this.formData.promoItemPrice) {
        this.showMessage("定价和现价不能为空", "error");
        return;
      }



      // 拼接并转换时区
      const startDateTime = `${this.formData.Date1}T${this.formData.startTime}`;
      const endDateTime = `${this.formData.Date2}T${this.formData.endTime}`;

      console.log("前端传递的开始时间：", startDateTime);
      console.log("前端传递的结束时间：", endDateTime);


      try {
        this.isSubmitting = true;

        // 第一步：上传图片并获取图片URL
        const formData = new FormData();
        formData.append('file', this.selectedFile);

        const uploadResponse = await axios.post('http://localhost:8082/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (!uploadResponse.data.imgUrl) {
          throw new Error('图片上传失败，未返回图片URL');
        }

        // 第二步：提交商品信息（包含图片URL）
        const itemData = {
          price: this.formData.price,
          promoItemPrice: this.formData.promoItemPrice,
          stock: this.formData.stock,
          sales: this.formData.sales,
          isNew: this.formData.isNew,
          isSpecial: this.formData.isSpecial,
          isSeckill: this.formData.isSeckill,
          startDate: startDateTime,
          endDate: endDateTime,
          points: this.formData.points,
          title: this.formData.title,
          description: this.formData.description,
          imgUrl: uploadResponse.data.imgUrl, // 使用上传后返回的图片URL
          promoName: this.formData.promoName,
        };
        console.log("前端传递的所有参数：", itemData);

        const response = await axios.post('http://localhost:8082/publishPromo', itemData);

        this.showMessage("商品信息提交成功", "success");
        console.log("接口调用成功，返回结果：", response.data);

        // 重置表单
        setTimeout(() => {
          this.resetForm();
        }, 1500);

      } catch (error) {
        this.showMessage(`商品信息提交失败: ${error.response?.data?.message || error.message}`, "error");
        console.error("接口调用失败：", error);
      } finally {
        this.isSubmitting = false;
      }
    },

    // 重置表单
    resetForm() {
      this.formData = {
        price: 35.00,
        promoItemPrice: 30.00,
        stock: 9983,
        sales: 0,
        isNew: "是",
        isSpecial: "是",
        isSeckill: "是",
        Date1: "2025-08-20",
        startTime: "20:30:30",
        Date2: "2025-08-20",
        endTime: "22:30:30",
        points: 0,
        promoName: "",
        title: "",
        description: "",
      };

      this.imgUrl = "";
      this.selectedFile = null;
    }
  },
  beforeUnmount() {
    // 释放blob URL资源
    if (this.imgUrl) {
      URL.revokeObjectURL(this.imgUrl);
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

.bold-label {
  font-weight: bold;
  margin-bottom: 5px;
}

.row {
  display: flex;
  align-items: center;
}

.col-label {
  flex: 0 0 120px;
  margin-right: 10px;
}

.col-input {
  flex: 1;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 4px;
}

input,
textarea,
select {
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 4px;
}

textarea {
  resize: vertical;
}

button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

button:hover:not(:disabled) {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

#message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  transition: all 0.3s;
}

.success {
  background-color: #dff0d8;
  color: #3c763d;
}

.error {
  background-color: #f2dede;
  color: #a94442;
}
</style>
