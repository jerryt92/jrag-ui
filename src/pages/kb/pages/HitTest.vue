<template>
	<div class="hit-test-container">
		<div class="hit-test-result">
			<div class="table-wrapper">
				<el-table
					ref="tableRef"
					:data="retrieveResultList"  style="width: 100%; height: 100%"
					v-loading="loading"
					border
				>
					<el-table-column :label="t('kb.outline')" width="300">
						<template #default="item">
							<el-popover
								effect="dark"
								trigger="hover"
								placement="top"
								width="400"
							>
								<template #reference>
									<div class="outline-preview">
										{{ item.row.outline }}
									</div>
								</template>
								<div class="outline-full">
									<div class="text-chunk-full">{{ item.row.outline }}</div>
								</div>
							</el-popover>
						</template>
					</el-table-column>
					<el-table-column
						prop="denseMetricType"
						:label="t('kb.knowledge.hit.test.dense.metric')"
						width="170"
					/>
					<el-table-column
						:label="t('kb.knowledge.hit.test.dense.score')"
						width="170"
						:formatter="(row) => formatScore(row.denseScore)"
					>
						<template #header>
							<div class="header-with-tooltip">
								<span>{{ t('kb.knowledge.hit.test.dense.score') }}</span>
								<el-tooltip
									effect="dark"
									placement="top"
									:raw-content="true"
									:content="t('kb.knowledge.hit.test.dense.score.tip')"
								>
									<el-icon class="info-icon">
										<QuestionFilled />
									</el-icon>
								</el-tooltip>
							</div>
						</template>
					</el-table-column>
					<el-table-column
						prop="sparseMetricType"
						:label="t('kb.knowledge.hit.test.sparse.metric')"
						width="170"
					/>
					<el-table-column
						:label="t('kb.knowledge.hit.test.sparse.score')"
						width="170"
						:formatter="(row) => formatScore(row.sparseScore)"
					>
						<template #header>
							<div class="header-with-tooltip">
								<span>{{ t('kb.knowledge.hit.test.sparse.score') }}</span>
								<el-tooltip
									effect="dark"
									placement="top"
									:raw-content="true"
									:content="t('kb.knowledge.hit.test.sparse.score.tip')"
								>
									<el-icon class="info-icon">
										<QuestionFilled />
									</el-icon>
								</el-tooltip>
							</div>
						</template>
					</el-table-column>
					<el-table-column
						:label="t('kb.knowledge.hit.test.hybrid.score')"
						width="170"
						:formatter="(row) => formatScore(row.hybridScore ?? row.score)"
					/>
					<el-table-column :label="t('kb.textChunk')" width="400">
						<template #default="item">
							<el-popover
								effect="dark"
								trigger="hover"
								placement="top"
								width="400"
							>
								<template #reference>
									<div class="text-chunk-preview">
										{{ item.row.textChunk }}
									</div>
								</template>
								<div class="text-chunk-full">{{ item.row.textChunk }}</div>
							</el-popover>
						</template>
					</el-table-column>
					<el-table-column
						prop="isFiltered"
						:label="t('kb.knowledge.hit.test.is.hit')"
						width="150"
						:formatter="(row) => row.isFiltered ? t('common.no') : t('common.yes')"
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
				</el-table>
			</div>
		</div>
		<div class="hit-test-form">
			<el-form ref="formRef" :model="formData" label-width="120px">
				<el-form-item
					label="TOP-K"
					prop="topK"
					:rules="[{ required: true, message: t('common.input.required') }]"
				>
					<el-input-number
						class="top-k-input"
						v-model="formData.topK"
						:min="1"
						:max="15"
						controls-position="right"
					/>
				</el-form-item>
				<el-form-item
					:label="t('kb.knowledge.hit.test.text')"
					prop="text"
					class="input-area"
					:rules="[{ required: true, message: t('common.input.required') }]"
				>
					<ElInput
						v-model="formData.text"
						class="text-input"
						:placeholder="t('kb.knowledge.hit.test.text.placeholder')"
						type="textarea"
						:autosize="{ minRows: 5, maxRows: 10 }"
						:maxlength="4000"
						show-word-limit
						@keydown="handleKeydown"
						@input="handleInput"
						@keyup="handleKeyup"
					/>
					<el-button type="primary" @click="onSubmit">提交</el-button>
				</el-form-item>
			</el-form>
		</div>
	</div>
</template>

<script setup lang="ts">import {
	ElButton,
	ElForm,
	ElFormItem,
	ElInput,
	ElInputNumber,
	ElPopover,
	ElTable,
	ElTableColumn,
	ElTooltip,
	ElIcon,
} from 'element-plus'
import { ref } from 'vue'
import { t } from '@ai-system/lib'
import { retrieveKnowledge } from '@/api/kb/kb.api'
import { KnowledgeRetrieveItemDto } from '@/types/kb.model'
import { QuestionFilled } from '@element-plus/icons-vue'

// 表单数据
const formData = ref({
	text: '',
	topK: 5
})

// 表单引用
const formRef = ref<InstanceType<typeof ElForm>>()

const loading = ref(false)
const retrieveResultList = ref<KnowledgeRetrieveItemDto[]>([])

const formatScore = (value?: number) => {
	if (!Number.isFinite(value)) {
		return '-'
	}
	return value!.toFixed(4)
}

const onSubmit = async () => {
	if (!formRef.value) return
	await formRef.value.validate(async (valid) => {
		if (valid) {
			try {
				loading.value = true
				const response = await retrieveKnowledge(
					formData.value.text,
					formData.value.topK
				)
				retrieveResultList.value = response.data?.data || []
			} catch (error) {
				console.error('检索知识库失败:', error)
			} finally {
				loading.value = false
			}
		}
	})
}
let send: boolean = true

const handleKeydown = (event: KeyboardEvent) => {
	if (event.key === 'Enter' && !event.shiftKey) {
		send = true
		event.preventDefault()
	}
}

const handleInput = () => {
	send = false
}

const handleKeyup = () => {
	if (send) {
		send = false
		onSubmit()
	}
}
</script>

<style scoped lang="scss">.hit-test-container {
	font-family: Arial, sans-serif;
	height: 100%;

	.header-with-tooltip {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.hit-test-result {
		padding: 20px;
		background-color: color-mix(
				in srgb,
				var(--n-color-neutral-w),
				transparent 30%
		);
		backdrop-filter: blur(10px);
		border-radius: var(--n-radius-triple);
		min-height: 300px;
		height: calc(100% - 235px - 20px);


		.table-wrapper {
			height: 100%;
			border-radius: var(--n-radius-triple);
			flex: 1; // 占据剩余所有高度
			overflow: hidden; // 防止溢出，强制在内部滚动
			// 穿透 element-plus 样式，确保表格高度占满
			:deep(.el-table) {
				height: 100% !important;
			}
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
	}

	.hit-test-form {
		height: 235px;
		margin-top: 20px;
		padding: 20px;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		background-color: color-mix(
				in srgb,
				var(--n-color-neutral-w),
				transparent 30%
		);
		backdrop-filter: blur(10px);
		border-radius: var(--n-radius-triple);

		:deep(.el-form-item__label) {
			color: var(--n-color-font-dark);
			justify-content: flex-start;
		}

		.top-k-input {
			width: 100px;
			margin-right: 10px;

			:deep(.el-form-item) {
				margin-bottom: 20px;
			}

			:deep(.el-input__wrapper) {
				height: 40px;
				background-color: color-mix(
						in srgb,
						var(--n-color-neutral-w),
						transparent 30%
				);
			}

			:deep(.el-input-number) {
				width: 100%;

				.el-input__inner {
					text-align: left;
				}
			}
		}

		.input-area {
			.el-textarea {
				margin-bottom: 5px;

				&.text-input {
					:deep(.el-input__count) {
						right: 80px;
						bottom: 15px;
						background: rgba(255, 255, 255, 0);
					}

					:deep(.el-textarea__inner) {
						background: color-mix(
								in srgb,
								var(--n-color-neutral-w),
								transparent 80%
						);
						backdrop-filter: blur(10px);
						padding: 15px 20px;
						border-color: color-mix(
								in srgb,
								var(--n-color-neutral-w),
								transparent 80%
						);
						word-wrap: break-word;
						word-break: break-all;
						box-shadow: none;
					}

					:hover {
						box-shadow: 0px 0px 12px
						color-mix(
								in srgb,
								var(--el-color-primary-light-3),
								transparent 10%
						);
					}
				}
			}

			.el-button {
				position: absolute;
				right: 10px;
				bottom: 30px;
			}
		}
	}
}
</style>