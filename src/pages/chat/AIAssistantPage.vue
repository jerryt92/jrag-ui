<template>
	<div
		class="ai-assistant-page"
		:class="{ 'full-page': isFullscreen, 'mobile-page': isMobile }"
	>
		<!-- 仅在移动端允许拖动 -->
		<span
			v-show="isMobile"
			v-draggable="{ device: 'mobile' }"
			class="mobile-chat-manage"
			:class="{ active: chatViewRef?.showChatManage }"
			@click="handleChatManage"
			>…</span
		>
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
import { debounce } from '@jrag/lib'

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

onMounted(() => {
	resize()
	if (!isMobile.value) {
		nextTick(() => {
			chatViewRef.value.getHistoryListData()
		})
	}
	window.addEventListener(
		'resize',
		debounce(() => {
			resize()
		}, 10)
	)
})

onUnmounted(() => {
	window.removeEventListener('resize', resize)
})
</script>
<style lang="scss" scoped>
.ai-assistant-page {
	height: 100%;
	position: relative;

	.mobile-chat-manage {
		position: fixed;
		z-index: 999;
		right: 20px;
		top: 20px;
		font-size: 20px;
		cursor: pointer;
		background-color: var(--el-color-primary);
		border-radius: 50%;
		padding: 10px;
		color: #fff;
	}
}
</style>
