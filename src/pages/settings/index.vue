<template>
	<div class="settings-page">
		<topo-bar />
		<div class="settings-content" v-loading="loading">
			<div class="settings-header">
				<h2>{{ t('settings.title') }}</h2>
			</div>
			<el-tabs v-model="activeTab" class="settings-tabs">
				<el-tab-pane :label="t('settings.llm.section')" name="llm">
					<el-form :model="llmForm" label-width="180px">
						<div class="section-title">{{ t('settings.basic.section') }}</div>
						<el-form-item :label="t('settings.provider')">
							<el-select v-model="llmForm.provider" class="settings-select">
								<el-option
									:label="t('settings.provider.openai')"
									value="open-ai"
								/>
								<el-option
									:label="t('settings.provider.ollama')"
									value="ollama"
								/>
							</el-select>
						</el-form-item>
						<el-form-item :label="t('settings.use.rag')">
							<el-switch v-model="llmForm.useRag" />
						</el-form-item>
						<el-form-item :label="t('settings.use.tools')">
							<el-switch v-model="llmForm.useTools" />
						</el-form-item>
						<el-form-item :label="t('settings.temperature')">
							<el-input-number
								v-model="llmForm.temperature"
								:min="0"
								:max="2"
								:step="0.1"
							/>
						</el-form-item>

						<div class="section-title">{{ t('settings.ollama.section') }}</div>
						<div class="section-desc">{{ t('settings.ollama.desc') }}</div>
						<el-form-item :label="t('settings.model.name')">
							<el-input v-model="llmForm.ollamaModelName" />
						</el-form-item>
						<el-form-item :label="t('settings.base.url')">
							<el-input v-model="llmForm.ollamaBaseUrl" />
						</el-form-item>
						<el-form-item :label="t('settings.keep.alive.seconds')">
							<el-input-number v-model="llmForm.ollamaKeepAliveSeconds" :min="1" />
						</el-form-item>
						<el-form-item :label="t('settings.context.length')">
							<el-input-number v-model="llmForm.ollamaContextLength" :min="1" />
						</el-form-item>

						<div class="section-title">{{ t('settings.openai.section') }}</div>
						<div class="section-desc">{{ t('settings.openai.desc') }}</div>
						<el-form-item :label="t('settings.model.name')">
							<el-input v-model="llmForm.openAiModelName" />
						</el-form-item>
						<el-form-item :label="t('settings.base.url')">
							<el-input v-model="llmForm.openAiBaseUrl" />
						</el-form-item>
						<el-form-item :label="t('settings.completions.path')">
							<el-input v-model="llmForm.openAiCompletionsPath" />
						</el-form-item>
						<el-form-item :label="t('settings.api.key')">
							<el-input v-model="llmForm.openAiKey" type="password" show-password />
						</el-form-item>
						<el-form-item :label="t('settings.context.length')">
							<el-input-number v-model="llmForm.openAiContextLength" :min="1" />
						</el-form-item>
					</el-form>
					<div class="settings-actions">
						<el-button type="primary" :loading="saving" @click="saveSettings">
							{{ t('settings.save') }}
						</el-button>
					</div>
				</el-tab-pane>
				<el-tab-pane :label="t('settings.embedding.section')" name="embedding">
					<el-form :model="embeddingForm" label-width="180px">
						<div class="section-title">{{ t('settings.basic.section') }}</div>
						<el-form-item :label="t('settings.provider')">
							<el-select v-model="embeddingForm.provider" class="settings-select">
								<el-option
									:label="t('settings.provider.openai')"
									value="open-ai"
								/>
								<el-option
									:label="t('settings.provider.ollama')"
									value="ollama"
								/>
							</el-select>
						</el-form-item>

						<div class="section-title">{{ t('settings.ollama.section') }}</div>
						<div class="section-desc">{{ t('settings.ollama.desc') }}</div>
						<el-form-item :label="t('settings.model.name')">
							<el-input v-model="embeddingForm.ollamaModelName" />
						</el-form-item>
						<el-form-item :label="t('settings.base.url')">
							<el-input v-model="embeddingForm.ollamaBaseUrl" />
						</el-form-item>
						<el-form-item :label="t('settings.keep.alive.seconds')">
							<el-input-number v-model="embeddingForm.ollamaKeepAliveSeconds" :min="1" />
						</el-form-item>

						<div class="section-title">{{ t('settings.openai.section') }}</div>
						<div class="section-desc">{{ t('settings.openai.desc') }}</div>
						<el-form-item :label="t('settings.model.name')">
							<el-input v-model="embeddingForm.openAiModelName" />
						</el-form-item>
						<el-form-item :label="t('settings.base.url')">
							<el-input v-model="embeddingForm.openAiBaseUrl" />
						</el-form-item>
						<el-form-item :label="t('settings.embeddings.path')">
							<el-input v-model="embeddingForm.openAiEmbeddingsPath" />
						</el-form-item>
						<el-form-item :label="t('settings.api.key')">
							<el-input v-model="embeddingForm.openAiKey" type="password" show-password />
						</el-form-item>
					</el-form>
					<div class="settings-actions">
						<el-button type="primary" :loading="saving" @click="saveSettings">
							{{ t('settings.save') }}
						</el-button>
					</div>
				</el-tab-pane>
				<el-tab-pane :label="t('settings.rag.section')" name="rag">
					<el-form :model="ragForm" label-width="220px">
						<el-form-item :label="t('settings.rag.topk')">
							<el-input-number v-model="ragForm.topK" :min="1" />
						</el-form-item>
						<el-form-item :label="t('settings.rag.metric.type.dense')">
							<el-select v-model="ragForm.metricType" class="settings-select">
								<el-option label="COSINE" value="COSINE" />
								<el-option label="IP" value="IP" />
								<el-option label="L2" value="L2" />
							</el-select>
						</el-form-item>
						<el-form-item :label="t('settings.rag.metric.type.sparse')">
							<el-select :model-value="'BM25'" class="settings-select" disabled>
								<el-option label="BM25" value="BM25" />
							</el-select>
						</el-form-item>
						<el-form-item :label="t('settings.rag.weight.label')">
							<div class="rag-weight-slider">
								<el-slider
									v-model="denseWeightPercent"
									:min="0"
									:max="100"
									:show-tooltip="true"
									:format-tooltip="formatWeightTooltip"
								/>
								<div class="rag-weight-values">
									<span>{{ t('settings.rag.weight.dense') }}: {{ denseWeightPercent }}%</span>
									<span>{{ t('settings.rag.weight.sparse') }}: {{ 100 - denseWeightPercent }}%</span>
								</div>
							</div>
						</el-form-item>
						<el-form-item :label="t('settings.rag.metric.score.expr')">
							<el-input v-model="ragForm.metricScoreExpr" />
						</el-form-item>
					</el-form>
					<div class="settings-actions">
						<el-button type="primary" :loading="saving" @click="saveSettings">
							{{ t('settings.save') }}
						</el-button>
					</div>
				</el-tab-pane>
			</el-tabs>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
	ElButton,
	ElForm,
	ElFormItem,
	ElInput,
	ElInputNumber,
	ElOption,
	ElSelect,
	ElSlider,
	ElSwitch,
	ElTabPane,
	ElTabs,
	ElMessage,
	ElMessageBox
} from 'element-plus'
import { t } from '@ai-system/lib'
import TopoBar from '@/pages/components/topoBar.vue'
import { getProperties, putProperties } from '@/api/property.api'

const KEY_LLM_PROVIDER = 'llm-provider'
const KEY_LLM_USE_RAG = 'llm-use-rag'
const KEY_LLM_USE_TOOLS = 'llm-use-tools'
const KEY_LLM_TEMPERATURE = 'llm-temperature'
const KEY_LLM_OLLAMA_MODEL_NAME = 'llm-ollama-model-name'
const KEY_LLM_OLLAMA_BASE_URL = 'llm-ollama-base-url'
const KEY_LLM_OLLAMA_KEEP_ALIVE_SECONDS = 'llm-ollama-keep-alive-seconds'
const KEY_LLM_OLLAMA_CONTEXT_LENGTH = 'llm-ollama-context-length'
const KEY_LLM_OPENAI_MODEL_NAME = 'llm-open-ai-model-name'
const KEY_LLM_OPENAI_BASE_URL = 'llm-open-ai-base-url'
const KEY_LLM_OPENAI_COMPLETIONS_PATH = 'llm-open-ai-completions-path'
const KEY_LLM_OPENAI_KEY = 'llm-open-ai-key'
const KEY_LLM_OPENAI_CONTEXT_LENGTH = 'llm-open-ai-context-length'

const KEY_EMBEDDING_PROVIDER = 'embedding-provider'
const KEY_EMBEDDING_OLLAMA_MODEL_NAME = 'embedding-ollama-model-name'
const KEY_EMBEDDING_OLLAMA_BASE_URL = 'embedding-ollama-base-url'
const KEY_EMBEDDING_OLLAMA_KEEP_ALIVE_SECONDS = 'embedding-ollama-keep_alive_seconds'
const KEY_EMBEDDING_OPENAI_MODEL_NAME = 'embedding-open-ai-model-name'
const KEY_EMBEDDING_OPENAI_BASE_URL = 'embedding-open-ai-base-url'
const KEY_EMBEDDING_OPENAI_EMBEDDINGS_PATH = 'embedding-open-ai-embeddings-path'
const KEY_EMBEDDING_OPENAI_KEY = 'embedding-open-ai-key'

const KEY_RETRIEVE_TOP_K = 'RETRIEVE_TOP_K'
const KEY_RETRIEVE_METRIC_TYPE = 'RETRIEVE_METRIC_TYPE'
const KEY_RETRIEVE_METRIC_SCORE_COMPARE_EXPR = 'RETRIEVE_METRIC_SCORE_COMPARE_EXPR'
const KEY_RETRIEVE_DENSE_WEIGHT = 'RETRIEVE_DENSE_WEIGHT'
const KEY_RETRIEVE_SPARSE_WEIGHT = 'RETRIEVE_SPARSE_WEIGHT'

const activeTab = ref('llm')
const loading = ref(false)
const saving = ref(false)

const llmForm = ref({
	provider: 'open-ai',
	useRag: true,
	useTools: true,
	temperature: 0,
	ollamaModelName: 'qwen3:14b-q8_0',
	ollamaBaseUrl: 'http://172.16.8.107:11434',
	ollamaKeepAliveSeconds: 3600,
	ollamaContextLength: 32768,
	openAiModelName: 'qwen-plus',
	openAiBaseUrl: 'https://dashscope.aliyuncs.com',
	openAiCompletionsPath: '/compatible-mode/v1/chat/completions',
	openAiKey: '',
	openAiContextLength: 32768
})

const embeddingForm = ref({
	provider: 'open-ai',
	ollamaModelName: 'nomic-embed-text:latest',
	ollamaBaseUrl: 'http://127.0.0.1:11434',
	ollamaKeepAliveSeconds: 3600,
	openAiModelName: 'text-embedding-v4',
	openAiBaseUrl: 'https://dashscope.aliyuncs.com',
	openAiEmbeddingsPath: '/compatible-mode/v1/embeddings',
	openAiKey: ''
})
const embeddingSnapshot = ref('')

const ragForm = ref({
	topK: 5,
	metricType: 'COSINE',
	metricScoreExpr: '> 0.7',
	denseWeight: 0.5,
	sparseWeight: 0.5
})

const parseBoolean = (value?: string, fallback = false) => {
	if (value === undefined || value === null) {
		return fallback
	}
	return value.trim() === '1' || value.trim().toLowerCase() === 'true'
}

const parseNumber = (value?: string, fallback: number) => {
	if (value === undefined || value === null) {
		return fallback
	}
	const parsed = Number(value)
	return Number.isFinite(parsed) ? parsed : fallback
}

const normalizeRagWeights = () => {
	const dense = ragForm.value.denseWeight
	const sparse = ragForm.value.sparseWeight
	const total = dense + sparse
	if (!Number.isFinite(total) || total <= 0) {
		ragForm.value.denseWeight = 0.5
		ragForm.value.sparseWeight = 0.5
		return
	}
	ragForm.value.denseWeight = dense / total
	ragForm.value.sparseWeight = sparse / total
}

const denseWeightPercent = computed({
	get: () => Math.round(ragForm.value.denseWeight * 100),
	set: (value: number) => {
		const clamped = Math.min(100, Math.max(0, value))
		ragForm.value.denseWeight = clamped / 100
		ragForm.value.sparseWeight = (100 - clamped) / 100
	}
})

const formatWeightTooltip = (value: number) => {
	const densePercent = Math.min(100, Math.max(0, Math.round(value)))
	const sparsePercent = 100 - densePercent
	return `${t('settings.rag.weight.dense')}: ${densePercent}% / ${t('settings.rag.weight.sparse')}: ${sparsePercent}%`
}

const resolvePropertyMap = (res: any) => {
	if (res?.data?.data) {
		return res.data.data
	}
	return res?.data ?? {}
}

const loadSettings = async () => {
	loading.value = true
	try {
		const keys = [
			KEY_LLM_PROVIDER,
			KEY_LLM_USE_RAG,
			KEY_LLM_USE_TOOLS,
			KEY_LLM_TEMPERATURE,
			KEY_LLM_OLLAMA_MODEL_NAME,
			KEY_LLM_OLLAMA_BASE_URL,
			KEY_LLM_OLLAMA_KEEP_ALIVE_SECONDS,
			KEY_LLM_OLLAMA_CONTEXT_LENGTH,
			KEY_LLM_OPENAI_MODEL_NAME,
			KEY_LLM_OPENAI_BASE_URL,
			KEY_LLM_OPENAI_COMPLETIONS_PATH,
			KEY_LLM_OPENAI_KEY,
			KEY_LLM_OPENAI_CONTEXT_LENGTH,
			KEY_EMBEDDING_PROVIDER,
			KEY_EMBEDDING_OLLAMA_MODEL_NAME,
			KEY_EMBEDDING_OLLAMA_BASE_URL,
			KEY_EMBEDDING_OLLAMA_KEEP_ALIVE_SECONDS,
			KEY_EMBEDDING_OPENAI_MODEL_NAME,
			KEY_EMBEDDING_OPENAI_BASE_URL,
			KEY_EMBEDDING_OPENAI_EMBEDDINGS_PATH,
			KEY_EMBEDDING_OPENAI_KEY,
			KEY_RETRIEVE_TOP_K,
			KEY_RETRIEVE_METRIC_TYPE,
			KEY_RETRIEVE_METRIC_SCORE_COMPARE_EXPR,
			KEY_RETRIEVE_DENSE_WEIGHT,
			KEY_RETRIEVE_SPARSE_WEIGHT
		]
		const res = await getProperties(keys)
		const data = resolvePropertyMap(res)
		llmForm.value.provider = data[KEY_LLM_PROVIDER] || llmForm.value.provider
		llmForm.value.useRag = parseBoolean(data[KEY_LLM_USE_RAG], llmForm.value.useRag)
		llmForm.value.useTools = parseBoolean(
			data[KEY_LLM_USE_TOOLS],
			llmForm.value.useTools
		)
		llmForm.value.temperature = parseNumber(
			data[KEY_LLM_TEMPERATURE],
			llmForm.value.temperature
		)
		llmForm.value.ollamaModelName =
			data[KEY_LLM_OLLAMA_MODEL_NAME] || llmForm.value.ollamaModelName
		llmForm.value.ollamaBaseUrl =
			data[KEY_LLM_OLLAMA_BASE_URL] || llmForm.value.ollamaBaseUrl
		llmForm.value.ollamaKeepAliveSeconds = parseNumber(
			data[KEY_LLM_OLLAMA_KEEP_ALIVE_SECONDS],
			llmForm.value.ollamaKeepAliveSeconds
		)
		llmForm.value.ollamaContextLength = parseNumber(
			data[KEY_LLM_OLLAMA_CONTEXT_LENGTH],
			llmForm.value.ollamaContextLength
		)
		llmForm.value.openAiModelName =
			data[KEY_LLM_OPENAI_MODEL_NAME] || llmForm.value.openAiModelName
		llmForm.value.openAiBaseUrl =
			data[KEY_LLM_OPENAI_BASE_URL] || llmForm.value.openAiBaseUrl
		llmForm.value.openAiCompletionsPath =
			data[KEY_LLM_OPENAI_COMPLETIONS_PATH] || llmForm.value.openAiCompletionsPath
		llmForm.value.openAiKey = data[KEY_LLM_OPENAI_KEY] || llmForm.value.openAiKey
		llmForm.value.openAiContextLength = parseNumber(
			data[KEY_LLM_OPENAI_CONTEXT_LENGTH],
			llmForm.value.openAiContextLength
		)

		embeddingForm.value.provider =
			data[KEY_EMBEDDING_PROVIDER] || embeddingForm.value.provider
		embeddingForm.value.ollamaModelName =
			data[KEY_EMBEDDING_OLLAMA_MODEL_NAME] || embeddingForm.value.ollamaModelName
		embeddingForm.value.ollamaBaseUrl =
			data[KEY_EMBEDDING_OLLAMA_BASE_URL] || embeddingForm.value.ollamaBaseUrl
		embeddingForm.value.ollamaKeepAliveSeconds = parseNumber(
			data[KEY_EMBEDDING_OLLAMA_KEEP_ALIVE_SECONDS],
			embeddingForm.value.ollamaKeepAliveSeconds
		)
		embeddingForm.value.openAiModelName =
			data[KEY_EMBEDDING_OPENAI_MODEL_NAME] || embeddingForm.value.openAiModelName
		embeddingForm.value.openAiBaseUrl =
			data[KEY_EMBEDDING_OPENAI_BASE_URL] || embeddingForm.value.openAiBaseUrl
		embeddingForm.value.openAiEmbeddingsPath =
			data[KEY_EMBEDDING_OPENAI_EMBEDDINGS_PATH] ||
			embeddingForm.value.openAiEmbeddingsPath
		embeddingForm.value.openAiKey =
			data[KEY_EMBEDDING_OPENAI_KEY] || embeddingForm.value.openAiKey
		embeddingSnapshot.value = JSON.stringify(embeddingForm.value)
		ragForm.value.topK = parseNumber(KEY_RETRIEVE_TOP_K in data ? data[KEY_RETRIEVE_TOP_K] : undefined, ragForm.value.topK)
		ragForm.value.metricType =
			data[KEY_RETRIEVE_METRIC_TYPE] || ragForm.value.metricType
		ragForm.value.metricScoreExpr =
			data[KEY_RETRIEVE_METRIC_SCORE_COMPARE_EXPR] || ragForm.value.metricScoreExpr
		ragForm.value.denseWeight = parseNumber(
			KEY_RETRIEVE_DENSE_WEIGHT in data ? data[KEY_RETRIEVE_DENSE_WEIGHT] : undefined,
			ragForm.value.denseWeight
		)
		ragForm.value.sparseWeight = parseNumber(
			KEY_RETRIEVE_SPARSE_WEIGHT in data ? data[KEY_RETRIEVE_SPARSE_WEIGHT] : undefined,
			ragForm.value.sparseWeight
		)
		normalizeRagWeights()
	} catch (error) {
		ElMessage.error(t('settings.load.failed'))
	} finally {
		loading.value = false
	}
}

const buildPayload = () => {
	normalizeRagWeights()
	const toValue = (value: unknown) => {
		if (value === undefined || value === null) {
			return ''
		}
		return String(value)
	}
	return [
		{ propertyName: KEY_LLM_PROVIDER, propertyValue: toValue(llmForm.value.provider) },
		{ propertyName: KEY_LLM_USE_RAG, propertyValue: toValue(llmForm.value.useRag) },
		{ propertyName: KEY_LLM_USE_TOOLS, propertyValue: toValue(llmForm.value.useTools) },
		{ propertyName: KEY_LLM_TEMPERATURE, propertyValue: toValue(llmForm.value.temperature) },
		{
			propertyName: KEY_LLM_OLLAMA_MODEL_NAME,
			propertyValue: toValue(llmForm.value.ollamaModelName)
		},
		{
			propertyName: KEY_LLM_OLLAMA_BASE_URL,
			propertyValue: toValue(llmForm.value.ollamaBaseUrl)
		},
		{
			propertyName: KEY_LLM_OLLAMA_KEEP_ALIVE_SECONDS,
			propertyValue: toValue(llmForm.value.ollamaKeepAliveSeconds)
		},
		{
			propertyName: KEY_LLM_OLLAMA_CONTEXT_LENGTH,
			propertyValue: toValue(llmForm.value.ollamaContextLength)
		},
		{
			propertyName: KEY_LLM_OPENAI_MODEL_NAME,
			propertyValue: toValue(llmForm.value.openAiModelName)
		},
		{
			propertyName: KEY_LLM_OPENAI_BASE_URL,
			propertyValue: toValue(llmForm.value.openAiBaseUrl)
		},
		{
			propertyName: KEY_LLM_OPENAI_COMPLETIONS_PATH,
			propertyValue: toValue(llmForm.value.openAiCompletionsPath)
		},
		{ propertyName: KEY_LLM_OPENAI_KEY, propertyValue: toValue(llmForm.value.openAiKey) },
		{
			propertyName: KEY_LLM_OPENAI_CONTEXT_LENGTH,
			propertyValue: toValue(llmForm.value.openAiContextLength)
		},
		{
			propertyName: KEY_EMBEDDING_PROVIDER,
			propertyValue: toValue(embeddingForm.value.provider)
		},
		{
			propertyName: KEY_EMBEDDING_OLLAMA_MODEL_NAME,
			propertyValue: toValue(embeddingForm.value.ollamaModelName)
		},
		{
			propertyName: KEY_EMBEDDING_OLLAMA_BASE_URL,
			propertyValue: toValue(embeddingForm.value.ollamaBaseUrl)
		},
		{
			propertyName: KEY_EMBEDDING_OLLAMA_KEEP_ALIVE_SECONDS,
			propertyValue: toValue(embeddingForm.value.ollamaKeepAliveSeconds)
		},
		{
			propertyName: KEY_EMBEDDING_OPENAI_MODEL_NAME,
			propertyValue: toValue(embeddingForm.value.openAiModelName)
		},
		{
			propertyName: KEY_EMBEDDING_OPENAI_BASE_URL,
			propertyValue: toValue(embeddingForm.value.openAiBaseUrl)
		},
		{
			propertyName: KEY_EMBEDDING_OPENAI_EMBEDDINGS_PATH,
			propertyValue: toValue(embeddingForm.value.openAiEmbeddingsPath)
		},
		{
			propertyName: KEY_EMBEDDING_OPENAI_KEY,
			propertyValue: toValue(embeddingForm.value.openAiKey)
		},
		{
			propertyName: KEY_RETRIEVE_TOP_K,
			propertyValue: toValue(ragForm.value.topK)
		},
		{
			propertyName: KEY_RETRIEVE_METRIC_TYPE,
			propertyValue: toValue(ragForm.value.metricType)
		},
		{
			propertyName: KEY_RETRIEVE_METRIC_SCORE_COMPARE_EXPR,
			propertyValue: toValue(ragForm.value.metricScoreExpr)
		},
		{
			propertyName: KEY_RETRIEVE_DENSE_WEIGHT,
			propertyValue: toValue(ragForm.value.denseWeight)
		},
		{
			propertyName: KEY_RETRIEVE_SPARSE_WEIGHT,
			propertyValue: toValue(ragForm.value.sparseWeight)
		}
	]
}

const isEmbeddingChanged = () => {
	return embeddingSnapshot.value !== JSON.stringify(embeddingForm.value)
}

const confirmEmbeddingRebuild = async () => {
	await ElMessageBox.confirm(
		t('settings.embedding.rebuild.confirm'),
		t('settings.embedding.rebuild.title'),
		{
			confirmButtonText: t('settings.embedding.rebuild.confirm.ok'),
			cancelButtonText: t('settings.embedding.rebuild.confirm.cancel'),
			type: 'warning'
		}
	)
}

const saveSettings = async () => {
	saving.value = true
	try {
		if (isEmbeddingChanged()) {
			await confirmEmbeddingRebuild()
		}
		await putProperties(buildPayload())
		embeddingSnapshot.value = JSON.stringify(embeddingForm.value)
		ElMessage.success(t('settings.save.success'))
	} catch (error) {
		if (error !== 'cancel') {
			ElMessage.error(t('settings.save.failed'))
		}
	} finally {
		saving.value = false
	}
}

onMounted(() => {
	loadSettings()
})
</script>

<style scoped lang="scss">
.settings-page {
	height: 100%;
	padding-top: 50px;
}

.settings-content {
	padding: 20px;
	height: calc(100% - 50px);
	overflow: auto;
}

.settings-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 10px;

	h2 {
		margin: 0;
		color: var(--n-color-font-dark);
		font-weight: 600;
	}
}

.settings-tabs {
	background: color-mix(in srgb, var(--n-color-neutral-w), transparent 90%);
	border-radius: var(--n-radius-quadruple);
	padding: 10px 20px 20px;
	box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
}

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

.rag-weight-slider {
	width: 320px;

	.rag-weight-values {
		display: flex;
		justify-content: space-between;
		margin-top: 6px;
		color: var(--n-color-neutral-6);
		font-size: 12px;
	}
}
</style>
