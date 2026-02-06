<template>
	<div class="qa-form-container">
		<el-form
			ref="qaFormRef"
			:model="qaFormData"
			:rules="rules"
			label-width="100px"
			v-loading="submitting"
			class="qa-form"
		>
			<el-form-item :label="t('kb.question')" prop="questions">
				<div class="question-list">
					<div
						v-for="(question, index) in qaFormData.questions"
						:key="index"
						class="question-item"
					>
						<el-input
							v-model="qaFormData.questions[index]"
							:placeholder="t('common.placeholder')"
						></el-input>
						<el-button
							type="danger"
							text
							:disabled="qaFormData.questions.length === 1"
							@click="removeQuestion(index)"
						>
							{{ t('common.delete') }}
						</el-button>
					</div>
					<el-button type="primary" text @click="addQuestion">
						{{ t('common.add') }}
					</el-button>
				</div>
			</el-form-item>
			<el-form-item :label="t('kb.answer')" prop="answer">
				<el-input
					v-model="qaFormData.answer"
					:placeholder="t('common.placeholder')"
					type="textarea"
					:rows="6"
				></el-input>
			</el-form-item>
			<el-form-item :label="t('kb.description')">
				<el-input
					v-model="qaFormData.description"
					:placeholder="t('common.placeholder')"
				></el-input>
			</el-form-item>
			<el-form-item>
				<div class="submit-btn-container">
					<el-button type="primary" @click="handleSubmit">
						{{ t('common.submit') }}
					</el-button>
				</div>
			</el-form-item>
		</el-form>
	</div>
</template>
<script setup lang="ts">
import { t } from '@ai-system/lib'
import { ElButton, ElForm, ElFormItem, ElInput, ElMessage } from 'element-plus'
import { ref } from 'vue'
import { KnowledgeAddDto } from '@/types/kb.model'
import { putKnowledge } from '@/api/kb/kb.api'

const qaFormRef = ref()
const submitting = ref(false)
defineExpose({
	clearForm,
	setFormData
})
const emit = defineEmits<{
	(e: 'add-success'): void
	(e: 'loading-change', loading: boolean): void
}>()

// 表单数据
const qaFormData = ref({
	id: '',
	questions: [''],
	answer: '',
	description: '',
	tags: [] as string[]
})

// 表单验证规则
const rules = {
	questions: [
		{
			validator: (_rule: any, value: string[], callback: (error?: Error) => void) => {
				const normalized = (value || []).map(item => `${item || ''}`.trim())
				if (!normalized.length || normalized.some(item => !item)) {
					callback(new Error(t('common.input.required')))
					return
				}
				callback()
			},
			trigger: 'blur'
		}
	],
	answer: [
		{ required: true, message: t('common.input.required'), trigger: 'blur' }
	]
}

const addQuestion = () => {
	qaFormData.value.questions.push('')
}

const removeQuestion = (index: number) => {
	if (qaFormData.value.questions.length === 1) return
	qaFormData.value.questions.splice(index, 1)
}

function clearForm() {
	qaFormData.value.id = ''
	qaFormData.value.questions = ['']
	qaFormData.value.answer = ''
	qaFormData.value.description = ''
	qaFormData.value.tags = []
	// 如果需要重置表单验证状态
	if (qaFormRef.value) {
		qaFormRef.value.clearValidate()
	}
}

function setFormData(data: {
	id?: string
	textChunkId?: string
	outline?: string[]
	textChunk?: string
	description?: string
}) {
	qaFormData.value.id = data.id || data.textChunkId || ''
	qaFormData.value.questions =
		data.outline && data.outline.length > 0 ? [...data.outline] : ['']
	qaFormData.value.answer = data.textChunk || ''
	qaFormData.value.description = data.description || ''
	if (qaFormRef.value) {
		qaFormRef.value.clearValidate()
	}
}

const handleSubmit = async () => {
	if (!qaFormRef.value) return
	await qaFormRef.value.validate(async (valid) => {
		if (valid) {
			submitting.value = true
			emit('loading-change', true) // 发送加载状态
			try {
				// 构造 KnowledgeAddDto 数据
				const outline = qaFormData.value.questions
					.map(item => `${item || ''}`.trim())
					.filter(Boolean)
				const knowledgeData: KnowledgeAddDto[] = [
					{
						id: qaFormData.value.id || undefined,
						outline,
						textChunk: qaFormData.value.answer,
						description: qaFormData.value.description
					}
				]
				await putKnowledge(knowledgeData)
				ElMessage.success(t('common.success'))
				emit('add-success')
			} catch (error) {
				ElMessage.error(t('common.fail'))
				console.error(error)
			} finally {
				submitting.value = false
				emit('loading-change', false) // 发送加载状态结束
			}
		}
	})
}
</script>
<style scoped lang="scss">
.qa-form-container {
	.qa-form {
		:deep(.el-form-item) {
			margin-bottom: 20px;
		}

		:deep(.el-form-item__label) {
			font-weight: 500;
		}
	}

	.question-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 100%;
	}

	.question-item {
		display: flex;
		gap: 10px;
		align-items: center;
	}

	.question-item :deep(.el-input) {
		flex: 1;
	}

	.submit-btn-container {
		display: flex;
		margin-top: 10px;
		width: 100%;
	}
}
</style>
