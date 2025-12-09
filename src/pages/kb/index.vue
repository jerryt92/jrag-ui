<template>
	<div class="layout-container">
		<topo-bar/>
		<div class="content-wrapper">
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
import { t } from '@jrag/lib'
import MarkdownUpload from '@/pages/kb/MarkdownUpload.vue'
import TopoBar from '@/pages/components/topoBar.vue'
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
</script>

<style scoped lang="scss">
.layout-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	overflow: hidden;

	.content-wrapper {
		display: flex;
		flex: 1;
		overflow: hidden;

		// 侧边栏样式
		:deep(.el-menu) {
			padding-top: 60px;
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
