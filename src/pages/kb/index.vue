<template>
	<div class="layout-container">
		<div class="top-bar">
			<h3>🤖 Jrag AI</h3>
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

		<div class="content-wrapper">
			<MenuCard
				ref="menuCardRef"
				class="menu-card"
				@show-change="showMenuCard = $event"
			/>
			<!-- 左侧导航栏 -->
			<el-menu
				:default-active="activeMenuItem"
				class="el-menu-vertical-demo"
				:collapse="isSidebarCollapsed"
				@open="handleOpen"
				@close="handleClose"
				@select="handleMenuSelect"
			>
				<el-menu-item index="1">
					{{ t('kb.knowledge.list') }}
				</el-menu-item>
				<el-menu-item index="2">
					{{ t('kb.knowledge.upload.markdown') }}
				</el-menu-item>
			</el-menu>
			<!-- 主内容区域 -->
			<main class="main-content">
				<!-- 内容区域 -->
				<div class="content-area">
					<component :is="currentComponent" v-if="currentComponent" />
					<div v-else class="placeholder">
						<p>请选择一个菜单项</p>
					</div>
				</div>
			</main>
		</div>
	</div>
</template>
<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { ElMenu, ElMenuItem } from 'element-plus'
import KnowledgeBase from '@/pages/kb/KnowledgeBase.vue'
import MenuCard from '@/pages/components/menuCard.vue'
import { t } from '@jrag/lib'
import MarkdownUpload from '@/pages/kb/MarkdownUpload.vue'
const menuCardRef = ref(null)
// 侧边栏状态
const isSidebarCollapsed = ref(false)
const activeMenuItem = ref('1-1')

// 当前显示的组件
const currentComponent = shallowRef(null)

// 切换侧边栏显示状态
const toggleSidebar = () => {
	isSidebarCollapsed.value = !isSidebarCollapsed.value
}

// 菜单事件处理
const handleOpen = (key: string, keyPath: string[]) => {
	console.log('Menu opened:', key, keyPath)
}

const handleClose = (key: string, keyPath: string[]) => {
	console.log('Menu closed:', key, keyPath)
}

// 菜单选择处理
const handleMenuSelect = (key: string, keyPath: string[]) => {
	activeMenuItem.value = key
	// 根据选择的菜单项切换组件
	switch (key) {
		case '1':
			currentComponent.value = KnowledgeBase
			break
		case '2':
			currentComponent.value = MarkdownUpload
			break
		default:
			currentComponent.value = KnowledgeBase
	}
}

const handleMenuCard = () => {
	menuCardRef.value.show()
}
</script>

<style scoped lang="scss">
.layout-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	overflow: hidden;

	.top-bar {
		position: relative;
		height: 50px;
		background: color-mix(in srgb, var(--n-color-neutral-w), transparent 80%);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.18);
		box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 20px;
		z-index: 100;

		h3 {
			font-size: 20px;
			font-weight: 500;
			color: var(--n-color-font-dark);
			text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		}

		.menu-button-box {
			.menu-button {
				font-size: 24px;
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
			}
		}
	}

	.menu-card {
		position: fixed;
		top: 60px;
		right: 10px;
		z-index: 100;
	}

	.content-wrapper {
		display: flex;
		flex: 1;
		overflow: hidden;

		// 侧边栏样式
		:deep(.el-menu) {
			border-right: none;
			height: 100%;
			// 添加与 MenuCard 相似的背景和边框样式
			background: color-mix(in srgb, var(--n-color-neutral-w), transparent 80%);
			backdrop-filter: blur(10px);
			border-right: 1px solid rgba(255, 255, 255, 0.18);
			box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
		}

		// 菜单项样式调整
		:deep(.el-menu-item) {
			// 添加圆角和悬停效果
			border-radius: 8px;
			margin: 5px 10px;
			transition: all 0.3s;
			color: var(--n-color-font-dark);
			&.is-active,
			&:hover {
				background-color: var(--el-color-primary);
				color: var(--n-color-neutral-w);
			}
		}

		// 折叠状态下菜单项的样式
		:deep(.el-menu--collapse .el-menu-item) {
			margin: 5px 5px;
		}
		.main-content {
			flex: 1;
			display: flex;
			flex-direction: column;
			overflow: hidden;

			.content-area {
				flex: 1;
				overflow: auto;
				padding: 20px;

				.placeholder {
					display: flex;
					justify-content: center;
					align-items: center;
					height: 100%;
					font-size: 18px;
					color: #999;
				}
			}
		}
	}
}
</style>
