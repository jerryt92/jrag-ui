<template>
	<div
		class="ai-assistant-page"
		:class="{ 'full-page': isFullscreen, 'mobile-page': isMobile }"
	>
		<topo-bar/>
		<!-- 功能导航卡片 -->
		<div class="feature-cards">
			<div class="feature-card" @click="goTo('/chat/assistant')">
				<div class="card-icon">🤖</div>
				<h3>{{ t('ai.assistant') }}</h3>
				<p>{{ t('ai.assistant.desc') }}</p>
			</div>
			<div class="feature-card" @click="goTo('/kb')">
				<div class="card-icon">📚</div>
				<h3>{{ t('kb.knowledge.base') }}</h3>
				<p>{{ t('kb.management') }}</p>
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { debounce, t } from '@ai-system/lib'
import TopoBar from '@/pages/components/topoBar.vue'
import { getNewContextId } from '@/api/ai.api'
import { goTo } from '@/routes'

const route = useRoute()
const isFullscreen = ref(true)
const isMobile = ref(false)

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
	getNewContextId()
	resize()
	handleMobileSafariHeight()
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
	padding-top: 50px;

	.feature-cards {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 20px;
		padding: 30px 20px;

		.feature-card {
			width: 220px;
			background: var(--n-color-neutral-1);
			border-radius: 12px;
			padding: 24px 20px;
			text-align: center;
			box-shadow: var(--n-color-opacity-3);
			cursor: pointer;
			transition: all 0.3s ease;

			&:hover {
				transform: translateY(-5px);
				box-shadow: 0px 0px 12px var(--el-color-primary-light-7);
			}

			.card-icon {
				font-size: 40px;
				margin-bottom: 16px;
			}

			h3 {
				font-size: 18px;
				font-weight: 600;
				color: var(--n-color-font-dark);
				margin-bottom: 8px;
			}

			p {
				font-size: 14px;
				color: var(--n-color-neutral-5);
				line-height: 1.5;
			}
		}
	}

	.chat-view {
		width: 100%;
	}
}
</style>
