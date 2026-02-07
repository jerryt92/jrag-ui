import routes from './routes'
import langLoaders from './locale'
import { App } from '@ai-system/lib'
import { ElLoading } from 'element-plus'
import { useDarkMode } from '@ai-system/hooks'
import { getSessionInfo } from '@/api/login.api'
import { setUserRole } from '@/utils/role'

import './styles/index.scss'

async function APP() {
	const app = new App({
		routeType: 'hash',
		routes,
		routeBase: import.meta.env.BASE_URL,
		langLoaders: [langLoaders],
		plugins: [ElLoading]
	})
	// 加载语言包
	const langMessage = await langLoaders(app.getLang())
	app.langMessage = langMessage
	// 国际化
	app.setUpLang([langLoaders])

	// 启用深色模式支持
	const { currentTheme } = useDarkMode()

	const isAuthRoute =
		location.hash.includes('/login') || location.hash.includes('/logout')
	if (!isAuthRoute) {
		try {
			const sessionResponse = await getSessionInfo()
			setUserRole(sessionResponse.data.role)
		} catch (error) {
			setUserRole(null)
		}
	}

	// 挂载路由
	app.createRouter(routes)
	// 挂载应用
	app.mount('#app')
	console.log('---->main app')
}

APP()
