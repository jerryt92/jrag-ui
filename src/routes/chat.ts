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
