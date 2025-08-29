import axios from 'axios'
import router from '../router.js'

// 创建Axios实例 - 移除环境变量引用，直接指定baseURL
const instance = axios.create({
    baseURL: 'http://localhost:8084', // 直接写死基础地址，避免环境变量问题
    timeout: 10000, // 10秒超时
    withCredentials: true, // 允许跨域携带cookie
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    }
})

// 请求拦截器
instance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`
            config.headers['access_token'] = accessToken
        }
        return config
    },
    (error) => {
        console.error('请求配置错误：', error)
        return Promise.reject({ message: '请求参数错误，请检查' })
    }
)

// 响应拦截器
instance.interceptors.response.use(
    (response) => {
        const resData = response.data
        if (resData.code && resData.code !== 200) {
            console.warn('业务错误：', resData.message)
            return Promise.reject({
                isBusinessError: true,
                code: resData.code,
                message: resData.message || '操作失败'
            })
        }
        return response
    },
    (error) => {
        let errorMsg = '网络异常，请稍后重试'

        if (error.response) {
            const { status } = error.response
            switch (status) {
                case 401:
                    if (router.currentRoute.value.path !== '/login') {
                        localStorage.removeItem('accessToken')
                        errorMsg = '登录已过期，请重新登录'
                        setTimeout(() => router.push('/login'), 500)
                    }
                    break
                case 403:
                    errorMsg = '没有权限执行此操作'
                    break
                case 404:
                    errorMsg = '请求的资源不存在'
                    break
                case 500:
                    errorMsg = '服务器内部错误，请稍后重试'
                    break
                default:
                    errorMsg = `请求失败（${status}）`
            }
        } else if (error.request) {
            errorMsg = '服务器无响应，请检查后端是否运行'
        }

        console.error('请求错误：', error)
        return Promise.reject({ message: errorMsg })
    }
)

export default instance
