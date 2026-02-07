<template>
	<div class="layout-container">
		<topo-bar/>
		<div class="content-wrapper">
			<el-menu
				:default-active="activeMenuItem"
				class="el-menu-vertical-demo"
				:collapse="isSidebarCollapsed"
				@open="handleOpen"
				@close="handleClose"
				@select="handleMenuSelect"
			>
				<el-menu-item index="1">
					{{ t('mcp.menu.status') }}
				</el-menu-item>
				<el-menu-item index="2">
					{{ t('mcp.menu.config') }}
				</el-menu-item>
			</el-menu>
			<main class="main-content">
				<div class="content-area">
					<component :is="currentComponent" v-if="currentComponent" />
					<div v-else class="placeholder">
						<p>{{ t('common.placeholder') }}</p>
					</div>
				</div>
			</main>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { ElMenu, ElMenuItem } from 'element-plus'
import { t } from '@ai-system/lib'
import TopoBar from '@/pages/components/topoBar.vue'
import McpServerStatus from '@/pages/mcp/pages/McpServerStatus.vue'
import McpServerConfig from '@/pages/mcp/pages/McpServerConfig.vue'

const isSidebarCollapsed = ref(false)
const activeMenuItem = ref('1')
const currentComponent = shallowRef(McpServerStatus)

const handleOpen = (key: string, keyPath: string[]) => {
	console.log('Menu opened:', key, keyPath)
}

const handleClose = (key: string, keyPath: string[]) => {
	console.log('Menu closed:', key, keyPath)
}

const handleMenuSelect = (key: string) => {
	activeMenuItem.value = key
	switch (key) {
		case '1':
			currentComponent.value = McpServerStatus
			break
		case '2':
			currentComponent.value = McpServerConfig
			break
		default:
			currentComponent.value = McpServerStatus
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

		:deep(.el-menu) {
			padding-top: 60px;
			border-right: none;
			height: 100%;
			background: color-mix(in srgb, var(--n-color-neutral-w), transparent 80%);
			backdrop-filter: blur(10px);
			border-right: 1px solid rgba(255, 255, 255, 0.18);
			box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
		}

		:deep(.el-menu-item) {
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

		:deep(.el-menu--collapse .el-menu-item) {
			margin: 5px 5px;
		}
		.main-content {
			padding-top: 50px;
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
