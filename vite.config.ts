import { defineConfig } from 'vite'
import { viteConfig } from './config/vite-config'
import defaultSettings from './setting'
const { devServer } = defaultSettings

export default defineConfig(({ command, mode }) => {
	const proxyServer = [
		{
			path: '^/v.+/auth/',
			target: 'http://' + devServer,
			rewrite: false
		},
		{
			path: '^/v.+/rest/',
			target: 'http://' + devServer,
			rewrite: false
		},
		{
			path: '/ws/',
			target: 'ws://' + devServer,
			rewrite: false
		},
		{
			path: '^/v.+/api/',
			target: 'http://' + devServer,
			rewrite: false
		}
	]
	return viteConfig(command, mode, proxyServer, 3110, '0.0.0.0')
})
