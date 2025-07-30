import routes from './routes'
import langLoaders from './locale'
import { App } from '@jrag/lib'
import { ElLoading } from 'element-plus'

import './styles/index.scss'

async function APP(){
	const app = new App({
		routeType: 'hash',
		routes,
		routeBase: import.meta.env.BASE_URL,
		langLoaders: [langLoaders],
		plugins: [ElLoading],
	})
	// 加载语言包
	const langMessage = await langLoaders(app.getLang())
	app.langMessage = langMessage
	// 国际化
	app.setUpLang([langLoaders])
	// 挂载路由
	app.createRouter(routes)
	// 挂载应用
	app.mount('#app')
	console.log('---->main app')
}

APP()
