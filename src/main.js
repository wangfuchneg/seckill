import { createApp } from 'vue'
import App from './App.vue'
import router from './router'  // 导入路由实例
import axios from './utils/axios'  // 导入axios实例

const app = createApp(App)

// 关键步骤：安装路由
app.use(router)

// 可选：全局注册axios，方便组件中通过this.$axios使用
app.config.globalProperties.$axios = axios

// 等待路由准备就绪后再挂载（避免路由跳转时的异步问题）
router.isReady().then(() => {
    app.mount('#app')
})
