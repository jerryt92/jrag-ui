<template>
	<div class="rag-settings-page" v-loading="loading">
		<div class="section-title">{{ t('settings.rag.section') }}</div>
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
			<el-button type="primary" :loading="saving" @click="saveRagSettings">
				{{ t('settings.save') }}
			</el-button>
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
	ElMessage,
	ElOption,
	ElSelect,
	ElSlider
} from 'element-plus'
import { t } from '@ai-system/lib'
import { getProperties, putProperties } from '@/api/property.api'

const KEY_RETRIEVE_TOP_K = 'RETRIEVE_TOP_K'
const KEY_RETRIEVE_METRIC_TYPE = 'RETRIEVE_METRIC_TYPE'
const KEY_RETRIEVE_METRIC_SCORE_COMPARE_EXPR = 'RETRIEVE_METRIC_SCORE_COMPARE_EXPR'
const KEY_RETRIEVE_DENSE_WEIGHT = 'RETRIEVE_DENSE_WEIGHT'
const KEY_RETRIEVE_SPARSE_WEIGHT = 'RETRIEVE_SPARSE_WEIGHT'

const loading = ref(false)
const saving = ref(false)

const ragForm = ref({
	topK: 5,
	metricType: 'COSINE',
	metricScoreExpr: '> 0.7',
	denseWeight: 0.5,
	sparseWeight: 0.5
})

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

const parseNumber = (value?: string, fallback: number) => {
	if (value === undefined || value === null) {
		return fallback
	}
	const parsed = Number(value)
	return Number.isFinite(parsed) ? parsed : fallback
}

const resolvePropertyMap = (res: any) => {
	if (res?.data?.data) {
		return res.data.data
	}
	return res?.data ?? {}
}

const loadRagSettings = async () => {
	loading.value = true
	try {
		const res = await getProperties([
			KEY_RETRIEVE_TOP_K,
			KEY_RETRIEVE_METRIC_TYPE,
			KEY_RETRIEVE_METRIC_SCORE_COMPARE_EXPR,
			KEY_RETRIEVE_DENSE_WEIGHT,
			KEY_RETRIEVE_SPARSE_WEIGHT
		])
		const data = resolvePropertyMap(res)
		ragForm.value.topK = parseNumber(
			KEY_RETRIEVE_TOP_K in data ? data[KEY_RETRIEVE_TOP_K] : undefined,
			ragForm.value.topK
		)
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

const saveRagSettings = async () => {
	saving.value = true
	try {
		normalizeRagWeights()
		await putProperties([
			{ propertyName: KEY_RETRIEVE_TOP_K, propertyValue: String(ragForm.value.topK) },
			{ propertyName: KEY_RETRIEVE_METRIC_TYPE, propertyValue: ragForm.value.metricType },
			{
				propertyName: KEY_RETRIEVE_METRIC_SCORE_COMPARE_EXPR,
				propertyValue: ragForm.value.metricScoreExpr
			},
			{ propertyName: KEY_RETRIEVE_DENSE_WEIGHT, propertyValue: String(ragForm.value.denseWeight) },
			{ propertyName: KEY_RETRIEVE_SPARSE_WEIGHT, propertyValue: String(ragForm.value.sparseWeight) }
		])
		ElMessage.success(t('settings.save.success'))
	} catch (error) {
		ElMessage.error(t('settings.save.failed'))
	} finally {
		saving.value = false
	}
}

onMounted(() => {
	loadRagSettings()
})
</script>

<style scoped lang="scss">
.rag-settings-page {
	padding: 20px;
	background-color: color-mix(
			in srgb,
			var(--n-color-neutral-w),
			transparent 30%
	);
	backdrop-filter: blur(10px);
	border-radius: var(--n-radius-triple);

	.section-title {
		margin-bottom: 12px;
		font-weight: 600;
		color: var(--n-color-font-dark);
	}

	.settings-select {
		width: 240px;
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

	.settings-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 10px;
	}
}
</style>
