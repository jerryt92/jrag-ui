<template>
	<el-form :model="form" label-width="180px">
		<div class="section-title">{{ t('settings.basic.section') }}</div>
		<el-form-item :label="t('settings.provider')">
			<el-select v-model="form.provider" class="settings-select">
				<el-option :label="t('settings.provider.openai')" value="open-ai" />
				<el-option :label="t('settings.provider.ollama')" value="ollama" />
			</el-select>
		</el-form-item>

		<div class="section-title">{{ t('settings.ollama.section') }}</div>
		<div class="section-desc">{{ t('settings.ollama.desc') }}</div>
		<el-form-item :label="t('settings.model.name')">
			<el-input v-model="form.ollamaModelName" />
		</el-form-item>
		<el-form-item :label="t('settings.base.url')">
			<el-input v-model="form.ollamaBaseUrl" />
		</el-form-item>
		<el-form-item :label="t('settings.ollama.api.key')">
			<el-input v-model="form.ollamaKey" type="password" show-password />
		</el-form-item>
		<el-form-item :label="t('settings.keep.alive.seconds')">
			<el-input-number v-model="form.ollamaKeepAliveSeconds" :min="1" />
		</el-form-item>

		<div class="section-title">{{ t('settings.openai.section') }}</div>
		<div class="section-desc">{{ t('settings.openai.desc') }}</div>
		<el-form-item :label="t('settings.model.name')">
			<el-input v-model="form.openAiModelName" />
		</el-form-item>
		<el-form-item :label="t('settings.base.url')">
			<el-input v-model="form.openAiBaseUrl" />
		</el-form-item>
		<el-form-item :label="t('settings.embeddings.path')">
			<el-input v-model="form.openAiEmbeddingsPath" />
		</el-form-item>
		<el-form-item :label="t('settings.api.key')">
			<el-input v-model="form.openAiKey" type="password" show-password />
		</el-form-item>
	</el-form>
	<div class="settings-actions">
		<el-button type="primary" :loading="saving" @click="emit('save')">
			{{ t('settings.save') }}
		</el-button>
	</div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import {
	ElButton,
	ElForm,
	ElFormItem,
	ElInput,
	ElInputNumber,
	ElOption,
	ElSelect
} from 'element-plus'
import { t } from '@ai-system/lib'

type EmbeddingForm = {
	provider: string
	ollamaModelName: string
	ollamaBaseUrl: string
	ollamaKeepAliveSeconds: number
	ollamaKey: string
	openAiModelName: string
	openAiBaseUrl: string
	openAiEmbeddingsPath: string
	openAiKey: string
}

const props = defineProps<{
	form: EmbeddingForm
	saving: boolean
}>()

const emit = defineEmits<{
	(e: 'save'): void
}>()

const form = toRef(props, 'form')
const saving = toRef(props, 'saving')
</script>

<style scoped lang="scss">
.settings-select {
	width: 240px;
}

.section-title {
	margin: 20px 0 10px;
	font-weight: 600;
	color: var(--n-color-font-dark);
}

.section-desc {
	margin-bottom: 10px;
	color: var(--n-color-neutral-5);
	font-size: 13px;
}

.settings-actions {
	display: flex;
	justify-content: flex-end;
	margin-top: 10px;
	padding-bottom: 10px;
}
</style>
