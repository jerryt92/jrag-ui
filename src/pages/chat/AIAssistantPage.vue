<template>
	<div
		class="ai-assistant-page"
		:class="{ 'full-page': isFullscreen, 'mobile-page': isMobile }"
	>
		<topo-bar>
			<template #external-menu>
				<span
					v-show="isMobile"
					v-draggable="{ device: 'mobile' }"
					class="menu-button"
					:class="{ active: chatManageActive }"
					@click="handleChatManage"
				>
				⌥
			</span>
			</template>
		</topo-bar>
		<!-- 添加聊天界面组件 -->
		<ChatView
			ref="chatViewRef"
			class="chat-view"
			:is-fullscreen="isFullscreen"
			:is-mobile="isMobile"
		/>
	</div>
</template>
<script setup lang="ts">
import ChatView from './components/ChatView.vue'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { debounce } from '@ai-system/lib'
import TopoBar from '@/pages/components/topoBar.vue'

const route = useRoute()
const chatViewRef = ref(null)
const isFullscreen = ref(true)
const isMobile = ref(false)

const handleChatManage = () => {
	chatViewRef.value.showChatManage = !chatViewRef.value.showChatManage
	if (chatViewRef.value.showChatManage) {
		nextTick(() => {
			chatViewRef.value.chatManageRef?.getHistoryListData()
		})
	}
}

const resize = () => {
	const width =
		window.innerWidth ||
		document.documentElement.clientWidth ||
		document.body.clientWidth

	if (width < 768 || route.query?.isMobile) {
		console.log('移动端视图')
		isMobile.value = true
		isFullscreen.value = false
		document.body.style.minWidth = '0px'
	} /* else if (width < 992) {
			console.log('平板视图');
	} */ else {
		console.log('桌面视图')
		isMobile.value = false
		isFullscreen.value = true
		document.body.style.minWidth = '768px'
	}
}

// 处理 Safari 移动端高度问题
const handleMobileSafariHeight = () => {
	if (isMobile.value) {
		// 使用 window.innerHeight 代替 100vh 解决 Safari 地址栏高度问题
		const app = document.querySelector('.web-app')
		if (app) {
			app.style.height = window.innerHeight + 'px'
		}
	} else {
		// 恢复默认高度设置
		const app = document.querySelector('.web-app')
		if (app) {
			app.style.height = ''
		}
	}
}

onMounted(() => {
	resize()
	handleMobileSafariHeight()
	if (!isMobile.value) {
		nextTick(() => {
			chatViewRef.value.getHistoryListData()
		})
	} else {
		// 移动端初始化时设置高度
		handleMobileSafariHeight()
	}

	window.addEventListener(
		'resize',
		debounce(() => {
			resize()
			// 移动端每次 resize 时重新设置高度
			handleMobileSafariHeight()
		}, 10)
	)

	// 监听屏幕方向变化
	window.addEventListener('orientationchange', () => {
		setTimeout(() => {
			handleMobileSafariHeight()
		}, 100)
	})
})

onUnmounted(() => {
	window.removeEventListener('resize', resize)
	window.removeEventListener('orientationchange', handleMobileSafariHeight)
})
</script>
<style lang="scss" scoped>
.ai-assistant-page {
	height: 100%;

	.chat-view {
		width: 100%;
	}

	.menu-button {
		font-size: 24px;
		margin-right: 5px;
		cursor: pointer;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #666;
		border-radius: 8px;
		transition: all 0.3s;

		&:hover {
			background-color: rgba(0, 0, 0, 0.05);
		}

		&.active {
			color: var(--el-color-primary);
			background-color: rgba(var(--el-color-primary-rgb), 0.1);
		}
	}
}
</style>
