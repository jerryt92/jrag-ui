<template>
	<div class="uploader-container">
		<el-table :data="knowledgeList" style="width: 100%" v-loading="loading">
			<el-table-column prop="fileName" :label="t('kb.fileName')" />
			<el-table-column prop="description" :label="t('kb.description')" />
			<el-table-column prop="embeddingModel" :label="t('kb.embeddingModel')" />
			<el-table-column
				prop="embeddingProvider"
				:label="t('kb.embeddingProvider')"
			/>
			<el-table-column :label="t('kb.textChunk')" width="300">
				<template #default="scope">
					<el-popover effect="dark" trigger="hover" placement="top" width="400">
						<template #reference>
							<div class="text-chunk-preview">{{ scope.row.textChunk }}</div>
						</template>
						<div class="text-chunk-full">{{ scope.row.textChunk }}</div>
					</el-popover>
				</template>
			</el-table-column>
			<el-table-column :label="t('kb.outline')" width="300">
				<template #default="scope">
					<el-popover effect="dark" trigger="hover" placement="top" width="400">
						<template #reference>
							<div class="outline-preview">
								{{ scope.row.outline?.join(', ') }}
							</div>
						</template>
						<div class="outline-full">
							<div v-for="(item, index) in scope.row.outline" :key="index">
								{{ item }}
							</div>
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
import { onMounted, ref } from 'vue'
import { ElPagination, ElPopover, ElTable, ElTableColumn } from 'element-plus'
import { getKnowledge } from '@/api/kb/kb.api'
import { t } from '@jrag/lib'

const knowledgeList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

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

	.text-chunk-preview,
	.outline-preview {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.text-chunk-full,
	.outline-full {
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
