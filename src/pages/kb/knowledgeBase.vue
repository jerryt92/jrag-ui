<template>
	<div class="uploader-container">
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

		<el-table :data="knowledgeList" style="width: 100%" v-loading="loading">
			<el-table-column prop="fileName" :label="t('kb.fileName')" />
			<el-table-column prop="description" :label="t('kb.description')" />
			<el-table-column prop="embeddingModel" :label="t('kb.embeddingModel')" />
			<el-table-column prop="embeddingProvider" :label="t('kb.embeddingProvider')" />
			<el-table-column :label="t('kb.textChunk')" width="300">
				<template #default="scope">
					<el-popover
						effect="dark"
						trigger="hover"
						placement="top"
						width="400"
					>
						<template #reference>
							<div class="text-chunk-preview">{{ scope.row.textChunk }}</div>
						</template>
						<div class="text-chunk-full">{{ scope.row.textChunk }}</div>
					</el-popover>
				</template>
			</el-table-column>
			<el-table-column :label="t('kb.outline')" width="300">
				<template #default="scope">
					<el-popover
						effect="dark"
						trigger="hover"
						placement="top"
						width="400"
					>
						<template #reference>
							<div class="outline-preview">{{ scope.row.outline?.join(', ') }}</div>
						</template>
						<div class="outline-full">
							<div v-for="(item, index) in scope.row.outline" :key="index">{{ item }}</div>
						</div>
					</el-popover>
				</template>
			</el-table-column>
		</el-table>

		<el-pagination
			v-model:current-page="currentPage"
			v-model:page-size="pageSize"
			:page-sizes="[10, 20, 50, 100]"
			:total="total"
			layout="total, sizes, prev, pager, next, jumper"
			@size-change="handleSizeChange"
			@current-change="handleCurrentChange"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElTable, ElTableColumn, ElPagination, ElPopover } from 'element-plus'
import MenuCard from '@/pages/components/menuCard.vue'
import { getKnowledge } from '@/api/kb/kb.api'
import { t } from '@jrag/lib'

const menuCardRef = ref(null)
const showMenuCard = ref(false)
const knowledgeList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const handleMenuCard = () => {
	menuCardRef.value.show()
}

const loadKnowledge = async () => {
	loading.value = true
	try {
		const response = await getKnowledge(
			(currentPage.value - 1) * pageSize.value,
			pageSize.value + 1
		)
		const data = response.data?.data || []
		// 如果返回的数据比请求的pageSize多，则说明还有下一页
		if (data.length > pageSize.value) {
			// 截取实际需要显示的数据
			knowledgeList.value = data.slice(0, pageSize.value)
			// 这里可以根据需要设置total的值，比如设置一个较大的值表示还有更多数据
			total.value = (currentPage.value + 1) * pageSize.value
		} else {
			// 没有更多数据了
			knowledgeList.value = data
			total.value = (currentPage.value - 1) * pageSize.value + data.length
		}
	} catch (error) {
		console.error('Failed to load knowledge:', error)
		knowledgeList.value = []
		total.value = 0
	} finally {
		loading.value = false
	}
}

const handleSizeChange = (val: number) => {
	pageSize.value = val
	loadKnowledge()
}

const handleCurrentChange = (val: number) => {
	currentPage.value = val
	loadKnowledge()
}

onMounted(() => {
	loadKnowledge()
})
</script>

<style scoped lang="scss">
.uploader-container {
	font-family: Arial, sans-serif;
	padding: 70px 20px 20px;

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
	.menu-card {
		position: fixed;
		top: 60px;
		right: 10px;
		z-index: 100;
	}

	.text-chunk-preview, .outline-preview {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.text-chunk-full, .outline-full {
		max-height: 300px;
		overflow-y: auto;
	}

	.el-pagination {
		margin-top: 20px;
		display: flex;
		justify-content: center;
	}
}
</style>
