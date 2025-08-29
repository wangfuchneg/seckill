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
          oninput="this.value = this.value.replace(/[^0-9]/g, '')"
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
// 导入项目配置的Axios实例（也可改用基础axios，此处保持统一）
import axios from '../utils/axios.js'

export default {
  name: 'LoginForm',
  data() {
    return {
      telphone: '18076757556', // 预设测试手机号
      password: 'DA01EB30AC13D971A089514000D3108A', // 预设加密后密码
      errorMsg: '',
      isLoading: false
    }
  },
  methods: {
    async handleLogin() {
      this.errorMsg = ''
      this.isLoading = true

      // 1. 前端预校验：避免无效请求
      if (!/^1[3-9]\d{9}$/.test(this.telphone)) {
        this.errorMsg = '请输入11位有效手机号'
        this.isLoading = false
        return
      }
      if (this.password.trim().length === 0) {
        this.errorMsg = '密码不能为空'
        this.isLoading = false
        return
      }

      try {
        // 2. 关键修改：用 params 传递参数（匹配后端 @RequestParam）
        const response = await axios.post('/auth/login', {}, {
          params: {
            telphone: this.telphone, // 与后端参数名完全一致
            password: this.password   // 直接传递加密后密码（后端会比对加密值）
          }
        })

        // 3. 提取Token（后端返回 TokenVO，包含 accessToken 和 refreshToken）
        const { accessToken, refreshToken } = response.data
        if (accessToken) {
          // 存储Token（accessToken用于接口访问，refreshToken用于刷新）
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken || '')

          // 4. 跳转至showPromos
          this.$router.push('/showPromos')
              .then(() => {
                console.log('跳转成功！当前路由:', this.$router.currentRoute.value)
              })
              .catch((error) => {
                console.error('跳转失败：', error)
                this.errorMsg = '页面跳转失败，请重试'
              })
        } else {
          this.errorMsg = '登录成功，但未获取到访问凭证'
        }
      } catch (error) {
        // 5. 错误处理（区分后端业务错误和网络错误）
        if (error.response) {
          // 后端返回的错误（如用户不存在、密码错误）
          const errData = error.response.data
          // 后端抛 RuntimeException 时，错误信息可能在 message 或 error 字段
          this.errorMsg = `登录失败（${error.response.status}）：${
              errData.message || errData.error || '参数格式错误'
          }`
          console.log('后端错误详情：', errData)
        } else if (error.request) {
          this.errorMsg = '网络异常，请检查后端是否已启动（端口8084）'
        } else {
          this.errorMsg = '登录逻辑异常，请刷新页面重试'
        }
        console.error('登录请求失败：', error)
      } finally {
        // 6. 无论成功失败，都关闭加载状态
        this.isLoading = false
      }
    }
  },
  // 7. 已登录状态直接跳转（避免重复登录）
  mounted() {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      this.$router.push('/showPromos')
    }
  }
}
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
/* 禁用输入非数字（手机号） */
input[type="text"]::-webkit-inner-spin-button,
input[type="text"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
button {
  padding: 10px;
  background-color: #ff4400;
  color: white;
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