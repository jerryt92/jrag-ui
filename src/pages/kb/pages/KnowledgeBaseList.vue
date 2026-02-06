<template>
	<div class="kb-table-container">
		<div class="header-actions">
			<div class="btn-area">
				<el-button type="primary" @click="loadKnowledge">
					{{ '🔄 ' + t('common.refresh') }}
				</el-button>
				<el-button type="primary" @click="handleAdd">
					{{ '➕ ' + t('common.add') }}
				</el-button>
				<el-button
					type="danger"
					:disabled="selectedRows.length === 0"
					@click="handleDelete"
				>
					{{ '🗑️ ' + t('common.delete') }}
				</el-button>
			</div>
			<div class="search-area">
				<el-input
					v-model="searchKeyword"
					:placeholder="t('common.search.placeholder.keyword')"
					clearable
					style="width: 240px"
					@keyup.enter="handleSearch"
					@clear="handleSearch"
				/>
				<el-button type="primary" @click="handleSearch">
					{{ '🔍️ ' + t('common.search') }}
				</el-button>
			</div>
		</div>
		<div class="table-wrapper">
			<el-table
				ref="tableRef"
				:data="knowledgeList"
				style="width: 100%; height: 100%"
				v-loading="loading"
				border
				@selection-change="handleSelectionChange"
			>
				<el-table-column type="selection" width="55" align="center" />
				<el-table-column :label="t('kb.outline')" width="300">
					<template #default="scope">
						<el-popover effect="dark" trigger="hover" placement="top" width="400">
							<template #reference>
								<div class="outline-preview">
									{{ getOutlineDisplay(scope.row.outline) }}
								</div>
							</template>
							<div class="outline-full">
								<div v-for="(item, index) in scope.row.outline" :key="index">
									{{ index + 1 }}. {{ item }}
								</div>
							</div>
						</el-popover>
					</template>
				</el-table-column>
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
				<el-table-column
					prop="description"
					:label="t('kb.description')"
					min-width="150"
					show-overflow-tooltip
				/>
				<el-table-column
					prop="dimension"
					:label="t('kb.dimension')"
					width="130"
				/>
				<el-table-column
					prop="embeddingModel"
					:label="t('kb.embeddingModel')"
					width="150"
				/>
				<el-table-column
					prop="embeddingProvider"
					:label="t('kb.embeddingProvider')"
					width="150"
				/>
				<el-table-column
					prop="createTime"
					:label="t('common.create.time')"
					width="180"
				>
					<template #default="scope">
						{{ formatDateTime(scope.row.createTime) }}
					</template>
				</el-table-column>
				<el-table-column
					prop="updateTime"
					:label="t('common.update.time')"
					width="180"
				>
					<template #default="scope">
						{{ formatDateTime(scope.row.updateTime) }}
					</template>
				</el-table-column>
				<el-table-column
					prop="createUsername"
					:label="t('kb.create.username')"
					width="150"
				/>
				<el-table-column
					:label="t('common.action')"
					width="120"
					align="center"
					fixed="right"
				>
					<template #default="scope">
						<el-button type="primary" link @click="handleEdit(scope.row)">
							{{ t('common.edit') }}
						</el-button>
						<el-button
							type="danger"
							link
							@click="handleDeleteSingle(scope.row)"
						>
							{{ t('common.delete') }}
						</el-button>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<div class="pagination-wrapper">
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
		<KbAddDialog v-model="addDialogVisible" @addSuccess="addSuccess" />
		<KbEditDialog
			v-model="editDialogVisible"
			:knowledge="editingRow"
			@edit-success="editSuccess"
		/>
	</div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, nextTick, onMounted, ref } from 'vue'
import {
	ElButton,
	ElInput,
	ElMessage,
	ElMessageBox,
	ElPagination,
	ElPopover,
	ElTable,
	ElTableColumn
} from 'element-plus'
import { deleteKnowledge, getKnowledge } from '@/api/kb/kb.api'
import { formatDateTime, t } from '@ai-system/lib'

// 状态定义
const knowledgeList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchKeyword = ref('') // 搜索关键词
const selectedRows = ref<any[]>([]) // 选中的行数据
const KbAddDialog = defineAsyncComponent(
	() => import('../components/KbAddDialog.vue')
)
const KbEditDialog = defineAsyncComponent(
	() => import('../components/KbEditDialog.vue')
)

const addDialogVisible = ref(false)
const editDialogVisible = ref(false)
const editingRow = ref<any | null>(null)

// 加载数据
const loadKnowledge = async () => {
	loading.value = true
	try {
		// 注意：这里假设 getKnowledge API 支持传递 searchKeyword 参数
		// 如果 API 不支持，需要在前端过滤或者修改 API 定义
		const response = await getKnowledge(
			(currentPage.value - 1) * pageSize.value,
			pageSize.value + 1,
			searchKeyword.value
		)
		const data = response.data?.data || []

		// 如果是前端模拟分页/搜索，可以在这里对 data 进行 filter 处理

		if (data.length > pageSize.value) {
			knowledgeList.value = data.slice(0, pageSize.value)
			total.value = (currentPage.value + 1) * pageSize.value
		} else {
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

const getOutlineDisplay = (outline: string[]) => {
	if (!outline || outline.length === 0) return '-'
	if (outline.length <= 3) {
		return outline.join(' | ')
	} else {
		return `${outline.slice(0, 3).join(', ')}... (+${outline.length - 3}项)`
	}
}

// 事件处理：分页
const handleSizeChange = (val: number) => {
	pageSize.value = val
	loadKnowledge()
}

const handleCurrentChange = (val: number) => {
	currentPage.value = val
	loadKnowledge()
}

// 事件处理：搜索
const handleSearch = () => {
	currentPage.value = 1 // 搜索时重置回第一页
	loadKnowledge()
}

// 事件处理：新增
const handleAdd = async () => {
	try {
		// 确保异步组件加载完成
		await nextTick()
		addDialogVisible.value = true
	} catch (error) {
		console.error('Failed to load dialog component:', error)
	}
}

const addSuccess = () => {
	addDialogVisible.value = false
	loadKnowledge()
}

const editSuccess = () => {
	editDialogVisible.value = false
	loadKnowledge()
}

// 事件处理：多选变化
const handleSelectionChange = (selection: any[]) => {
	selectedRows.value = selection
}

// 事件处理：删除
const handleDelete = () => {
	if (selectedRows.value.length === 0) return

	ElMessageBox.confirm(
		`确认删除选中的 ${selectedRows.value.length} 项数据吗？`,
		'警告',
		{ confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
	).then(async () => {
			const ids = selectedRows.value.map(row => row.textChunkId)
			await deleteKnowledge(ids)
			ElMessage.success('删除成功')
			loadKnowledge()
		})
		.catch(() => {})
}

const handleDeleteSingle = (row: any) => {
	if (!row?.textChunkId) return
	ElMessageBox.confirm(
		'确认删除该条数据吗？',
		'警告',
		{ confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
	).then(async () => {
			await deleteKnowledge([row.textChunkId])
			ElMessage.success('删除成功')
			loadKnowledge()
		})
		.catch(() => {})
}

// 事件处理：单行编辑
const handleEdit = (row: any) => {
	editingRow.value = {
		...row,
		outline: row.outline ? [...row.outline] : []
	}
	editDialogVisible.value = true
}

onMounted(() => {
	loadKnowledge()
})
</script>

<style scoped lang="scss">
.kb-table-container {
	font-family: Arial, sans-serif;
	padding: 20px;
	height: 100%; /* 关键：撑满父容器高度 */
	min-width: 800px;
	display: flex; /* 关键：使用 Flex 布局 */
	flex-direction: column;
	box-sizing: border-box;
	background-color: color-mix(
		in srgb,
		var(--n-color-neutral-w),
		transparent 30%
	);
	backdrop-filter: blur(10px);
	border-radius: var(--n-radius-triple);
	// 1. 顶部工具栏样式
	.header-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
		flex-shrink: 0; // 防止头部被压缩
		.search-area {
			display: flex;
			gap: 10px;
		}

		.btn-area {
			display: flex;
			gap: 10px;
		}
	}

	// 2. 表格区域样式
	.table-wrapper {
		border-radius: var(--n-radius-triple);
		flex: 1; // 占据剩余所有高度
		overflow: hidden; // 防止溢出，强制在内部滚动
		// 穿透 element-plus 样式，确保表格高度占满
		:deep(.el-table) {
			height: 100% !important;
		}
	}

	// 3. 分页样式
	.pagination-wrapper {
		margin-top: 16px;
		display: flex;
		justify-content: flex-end;
		flex-shrink: 0; // 防止分页被压缩
	}

	// 内容预览样式
	.text-chunk-preview,
	.outline-preview {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		cursor: pointer;
		color: var(--el-color-primary);
	}

	.text-chunk-full,
	.outline-full {
		max-height: 300px;
		overflow-y: auto;
	}
}
</style>
