<template>
  <div class="login-container">
    <h2>登录</h2>
    <form @submit.prevent="handleLogin">
      <label for="telphone">手机号：</label>
      <input
          type="text"
          id="telphone"
          v-model="telphone"
          placeholder="请输入手机号"
          required
          maxlength="11"
          @input="handleTelInput"
      />

      <label for="password">密码：</label>
      <input
          type="password"
          id="password"
          v-model="password"
          placeholder="请输入密码"
          required
      />

      <button type="submit" :disabled="isLoading">
        <span v-if="isLoading">登录中...</span>
        <span v-else>登录</span>
      </button>
    </form>
    <p class="error-message" v-if="errorMsg">{{ errorMsg }}</p>
  </div>
</template>

<script>
// 导入项目配置的Axios实例
import axios from '../utils/axios.js';

export default {
  name: 'LoginForm',
  data() {
    return {
      telphone: '18076757556', // 预设测试手机号
      password: 'DA01EB30AC13D971A089514000D3108A', // 预设加密后密码
      errorMsg: '',
      isLoading: false
    };
  },
  methods: {
    // 手机号输入过滤：只允许数字（替换原生oninput，符合Vue规范）
    handleTelInput(e) {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    },

    // 登录逻辑（修复异步函数语法、解构安全性、错误处理规范）
    async handleLogin() {
      this.errorMsg = '';
      this.isLoading = true;

      // 1. 前端预校验
      if (!/^1[3-9]\d{9}$/.test(this.telphone)) {
        this.errorMsg = '请输入11位有效手机号';
        this.isLoading = false;
        return;
      }
      if (!this.password.trim()) {
        this.errorMsg = '密码不能为空';
        this.isLoading = false;
        return;
      }

      try {
        // 2. 发送登录请求（参数格式对齐后端@RequestParam）
        const response = await axios.post('/auth/login', {}, {
          params: {
            telphone: this.telphone,
            password: this.password
          }
        });

        // 3. 提取Token（增加解构默认值，避免无数据时报红）
        const { accessToken = '', refreshToken = '' } = response.data || {};
        if (accessToken) {
          // 存储Token
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);

          // 4. 路由跳转（使用this.$router确保全局路由实例）
          await this.$router.push('/showPromos');
          console.log('跳转成功！当前路由:', this.$router.currentRoute.value);
        } else {
          this.errorMsg = '登录成功，但未获取到访问凭证';
        }
      } catch (error) {
        // 5. 错误处理（细分错误类型，避免undefined访问报红）
        if (error.response) {
          const errData = error.response.data || {};
          this.errorMsg = `登录失败（${error.response.status}）：${
              errData.message || errData.error || '参数格式错误'
          }`;
          console.log('后端错误详情：', errData);
        } else if (error.request) {
          this.errorMsg = '网络异常，请检查后端是否已启动（端口8084）';
        } else {
          this.errorMsg = '登录逻辑异常，请刷新页面重试';
        }
        console.error('登录请求失败：', error);
      } finally {
        // 6. 关闭加载状态（无论成功失败都执行）
        this.isLoading = false;
      }
    }
  },
  // 7. 已登录状态直接跳转（修复mounted钩子语法）
  mounted() {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      this.$router.push('/showPromos');
    }
  }
};
</script>

<style scoped>
.login-container {
  width: 300px;
  margin: 100px auto;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
}

label {
  font-size: 14px;
  color: #333;
}

input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

/* 禁用输入框数字滚轮（修复浏览器兼容性报红） */
input[type="text"]::-webkit-inner-spin-button,
input[type="text"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

button {
  padding: 10px;
  background-color: #ff4400;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover:enabled {
  background-color: #e03c00;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: #e53935;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
}
</style>