<template>
	<el-form :model="form" label-width="180px">
		<div class="section-title">{{ t('settings.basic.section') }}</div>
		<el-form-item :label="t('settings.provider')">
			<el-select v-model="form.provider" class="settings-select">
				<el-option :label="t('settings.provider.openai')" value="open-ai" />
				<el-option :label="t('settings.provider.ollama')" value="ollama" />
			</el-select>
		</el-form-item>
		<el-form-item :label="t('settings.use.rag')">
			<el-switch v-model="form.useRag" />
		</el-form-item>
		<el-form-item :label="t('settings.use.tools')">
			<el-switch v-model="form.useTools" />
		</el-form-item>
		<el-form-item :label="t('settings.temperature')">
			<el-input-number v-model="form.temperature" :min="0" :max="2" :step="0.1" />
		</el-form-item>

		<div class="section-title">{{ t('settings.ollama.section') }}</div>
		<div class="section-desc">{{ t('settings.ollama.desc') }}</div>
		<el-form-item :label="t('settings.model.name')">
			<el-input v-model="form.ollamaModelName" />
		</el-form-item>
		<el-form-item :label="t('settings.base.url')">
			<el-input v-model="form.ollamaBaseUrl" />
		</el-form-item>
		<el-form-item :label="t('settings.keep.alive.seconds')">
			<el-input-number v-model="form.ollamaKeepAliveSeconds" :min="1" />
		</el-form-item>
		<el-form-item :label="t('settings.context.length')">
			<el-input-number v-model="form.ollamaContextLength" :min="1" />
		</el-form-item>

		<div class="section-title">{{ t('settings.openai.section') }}</div>
		<div class="section-desc">{{ t('settings.openai.desc') }}</div>
		<el-form-item :label="t('settings.model.name')">
			<el-input v-model="form.openAiModelName" />
		</el-form-item>
		<el-form-item :label="t('settings.base.url')">
			<el-input v-model="form.openAiBaseUrl" />
		</el-form-item>
		<el-form-item :label="t('settings.completions.path')">
			<el-input v-model="form.openAiCompletionsPath" />
		</el-form-item>
		<el-form-item :label="t('settings.api.key')">
			<el-input v-model="form.openAiKey" type="password" show-password />
		</el-form-item>
		<el-form-item :label="t('settings.context.length')">
			<el-input-number v-model="form.openAiContextLength" :min="1" />
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
	ElSelect,
	ElSwitch
} from 'element-plus'
import { t } from '@ai-system/lib'

type LlmForm = {
	provider: string
	useRag: boolean
	useTools: boolean
	temperature: number
	ollamaModelName: string
	ollamaBaseUrl: string
	ollamaKeepAliveSeconds: number
	ollamaContextLength: number
	openAiModelName: string
	openAiBaseUrl: string
	openAiCompletionsPath: string
	openAiKey: string
	openAiContextLength: number
}

const props = defineProps<{
	form: LlmForm
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
