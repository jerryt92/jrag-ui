export default [
	{
		path: '/chat/assistant',
		name: 'AIAssistant',
		component: () => import('@/pages/chat/AIAssistantPage.vue')
	},
	{
		path: '/chat/speech',
		name: 'SpeechDemo',
		component: () => import('@/pages/chat/components/SpeechDemo.vue')
	}
]

/**
 * 开启聊天保活ws通道
 * @param contextId
 */
export const openChatKeepAliveWsClient = (contextId: string) => {
	return new WebSocket(
		window.location.origin.replace('http', 'ws') +
		'/ws/jrag/chat/alive' +
		'?context-id=' +
		contextId
	)
}