import type { RouteRecordRaw } from 'vue-router'

import chat from '@/routes/chat'
import file from '@/routes/kb'

// 业务系统路由定义
const routes = [
	{
		path: '/login',
		name: 'Login',
		component: () => import('@/pages/login/Login.vue')
	},
	{
		path: '/logout',
		name: 'Logout',
		component: () => import('@/pages/login/Logout.vue')
	},
	{
		path: '/',
		name: 'Index',
		component: () => import('@/pages/HomePage.vue')
	},
	...chat,
	...file
] as RouteRecordRaw[]

export default routes
