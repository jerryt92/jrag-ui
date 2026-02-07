import type { RouteRecordRaw } from 'vue-router'

import chat from '@/routes/chat'
import kb from '@/routes/kb'
import mcp from '@/routes/mcp'
import settings from '@/routes/settings'

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
	...kb,
	...mcp,
	...settings
] as RouteRecordRaw[]

export default routes

export const goTo = (path: string) => {
	location.hash = path
}
