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
			<el-form-item :label="t('kb.question')" prop="question">
				<el-input
					v-model="qaFormData.question"
					:placeholder="t('common.placeholder')"
				></el-input>
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
	clearForm
})
const emit = defineEmits<{
	(e: 'add-success'): void
	(e: 'loading-change', loading: boolean): void
}>()

// 表单数据
const qaFormData = ref({
	question: '',
	answer: '',
	description: '',
	tags: [] as string[]
})

// 表单验证规则
const rules = {
	question: [
		{ required: true, message: t('common.input.required'), trigger: 'blur' }
	],
	answer: [
		{ required: true, message: t('common.input.required'), trigger: 'blur' }
	]
}

function clearForm() {
	qaFormData.value.question = ''
	qaFormData.value.answer = ''
	qaFormData.value.description = ''
	qaFormData.value.tags = []
	// 如果需要重置表单验证状态
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
				const knowledgeData: KnowledgeAddDto[] = [
					{
						outline: [qaFormData.value.question],
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

	.submit-btn-container {
		display: flex;
		margin-top: 10px;
		width: 100%;
	}
}
</style>
