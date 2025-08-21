import { createRouter, createWebHistory } from 'vue-router'
import publishPromo from '@/components/publishPromo.vue' // 替换为你实际的组件路径
import showPromos from '@/components/showPromos.vue'

const routes = [
    {
        path: '/publishPromo',
        name: 'publishPromo',
        component: publishPromo
    },
    {
        path: '/showPromos',
        name: 'showPromos',
        component: showPromos
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router