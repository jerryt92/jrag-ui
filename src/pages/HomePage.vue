<template>
	<div
		class="ai-assistant-page"
		:class="{ 'full-page': isFullscreen, 'mobile-page': isMobile }"
	>
		<div class="top-bar">
			<h3>🤖 数据通信百科助手</h3>
			<div class="menu-button-box">
				<span
					class="menu-button"
					:class="{ active: showMenuCard }"
					@click="handleMenuCard"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="feather feather-menu"
					>
						<line x1="3" y1="12" x2="21" y2="12"></line>
						<line x1="3" y1="6" x2="21" y2="6"></line>
						<line x1="3" y1="18" x2="21" y2="18"></line>
					</svg>
				</span>
			</div>
		</div>
		<MenuCard
			ref="menuCardRef"
			class="menu-card"
			@show-change="showMenuCard = $event"
		/>
		<!-- 功能导航卡片 -->
		<div class="feature-cards">
			<div class="feature-card" @click="goTo('/chat/assistant')">
				<div class="card-icon">🤖</div>
				<h3>{{ t('ai.assistant') }}</h3>
				<p>{{ t('ai.assistant.desc') }}</p>
			</div>
			<div class="feature-card" @click="goTo('/kb')" v-show="loginMode === 'user'">
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
import { debounce, t } from '@jrag/lib'
import MenuCard from '@/pages/components/menuCard.vue'
import { checkApCenterApi } from '@/api/ai.api'

const route = useRoute()
const menuCardRef = ref(null)
const showMenuCard = ref(false)
const isFullscreen = ref(true)
const isMobile = ref(false)

const handleMenuCard = () => {
	menuCardRef.value.show()
}

const goTo = (path: string) => {
	window.location.href = '/#' + path
}

const resize = () => {
	const width =
		window.innerWidth ||
		document.documentElement.clientWidth ||
		document.body.clientWidth

	if (width < 768 || route.query?.isMobile) {
		isMobile.value = true
		isFullscreen.value = false
		document.body.style.minWidth = '0px'
	} /* else if (width < 992) {
			// 平板视图
	} */ else {
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
	checkApCenterApi()
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

	.menu-card {
		position: fixed;
		top: 60px;
		right: 10px;
		z-index: 100;
	}

	.top-bar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 50px;
		background: color-mix(in srgb, var(--n-color-neutral-w), transparent 80%);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.18);
		box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
		display: flex;
		align-items: center;
		justify-content: left;
		z-index: 100;

		h3 {
			margin-left: 20px;
			font-size: 20px;
			font-weight: 500;
			color: var(--n-color-font-dark);
			text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		}

		.menu-button-box {
			position: absolute;
			display: flex;
			right: 0;
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
	}
}
</style>
