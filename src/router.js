import { createRouter, createWebHistory } from 'vue-router'
import publishPromo from '@/components/publishPromo.vue'
import showPromos from '@/components/showPromos.vue'
import LoginForm from '@/components/LoginForm.vue'
import { jwtDecode } from 'jwt-decode'
import axios from '../src/utils/axios' // 导入Axios实例，用于刷新Token

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: LoginForm,
        meta: { requiresAuth: false, title: '登录' }
    },
    {
        path: '/publishPromo',
        name: 'publishPromo',
        component: publishPromo,
        meta: { requiresAuth: true, title: '发布促销' }
    },
    {
        path: '/showPromos',
        name: 'showPromos',
        component: showPromos,
        meta: {
            requiresAuth: true,
            title: '促销活动列表'
        }
    },
    {
        path: '/',
        redirect: '/showPromos'
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        redirect: '/showPromos'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 避免重复触发刷新Token请求
let isRefreshing = false
// 存储等待刷新Token的请求队列
let requestQueue = []

// 刷新Token的方法
const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
        throw new Error('无刷新Token，需重新登录')
    }
    try {
        const response = await axios.post('/auth/refresh', {}, {
            headers: { 'refresh_token': refreshToken }
        })
        const { accessToken } = response.data
        localStorage.setItem('accessToken', accessToken)
        return accessToken
    } catch (error) {
        // 刷新Token失败，清除所有Token
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        throw error
    }
}

router.beforeEach(async (to, from, next) => {
    document.title = to.meta.title || '秒杀系统'

    // 1. 不需要登录的页面直接放行（如登录页）
    if (!to.meta.requiresAuth) {
        next()
        return
    }

    // 2. 需要登录的页面：先获取Token
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) {
        next({ name: 'Login' })
        return
    }

    try {
        // 3. 校验Token有效性
        const decoded = jwtDecode(accessToken)
        const currentTime = Date.now() / 1000

        // Token未过期：直接放行
        if (!decoded.exp || decoded.exp > currentTime) {
            next()
            return
        }

        // Token已过期：尝试刷新Token
        if (!isRefreshing) {
            isRefreshing = true
            // 调用后端刷新接口
            const newAccessToken = await refreshToken()
            isRefreshing = false

            // 唤醒等待队列中的请求
            requestQueue.forEach(cb => cb(newAccessToken))
            requestQueue = []

            // 刷新成功后，继续当前跳转
            next({ ...to, replace: true })
        } else {
            // 若正在刷新Token，将当前请求加入队列
            requestQueue.push((newAccessToken) => {
                // 替换请求头中的Token，继续跳转
                axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`
                next({ ...to, replace: true })
            })
        }
    } catch (error) {
        // 4. Token解析失败/刷新失败：跳转登录页
        console.error('Token校验失败：', error)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        // 避免从登录页跳转时重复循环
        if (to.name !== 'Login') {
            next({ name: 'Login' })
        } else {
            next()
        }
    }
})

export default router