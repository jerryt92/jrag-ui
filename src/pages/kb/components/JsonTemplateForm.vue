<template>
	<div class="json-template-form-container">
		<div class="download-template">
			<el-button
				type="primary"
				@click="downloadTemplate"
				:loading="downloading"
			>
				{{ t('kb.download.json.template') }}
			</el-button>
		</div>

		<div class="upload-section" style="margin-top: 20px">
			<el-upload
				ref="uploadRef"
				:auto-upload="false"
				:multiple="false"
				:on-change="handleFileChange"
				:on-remove="handleFileRemove"
				:file-list="fileList"
				accept=".json"
				:limit="1"
				drag
			>
				<el-icon class="el-icon--upload">
					<upload />
				</el-icon>
				<div class="el-upload__text">
					<em>{{ t('kb.json.template.drop.or.click.upload') }}</em>
				</div>
			</el-upload>
		</div>
		<div v-if="selectedFile" class="file-info" style="margin-top: 10px">
			<p>
				{{ t('common.selected.file') }}: {{ selectedFile.name }} ({{
					formatFileSize(selectedFile.size)
				}})
			</p>
		</div>
		<div class="submit-btn-container">
			<el-button
				type="success"
				:disabled="!selectedFile"
				:loading="uploading"
				@click="submitUpload"
			>
				{{ t('common.submit') }}
			</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { t } from '@ai-system/lib'
import {
	ElButton,
	ElIcon,
	ElMessage,
	ElUpload,
	type UploadFile,
	type UploadFiles,
	type UploadInstance
} from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { downloadJsonTemplate, importJsonKnowledge } from '@/api/kb/kb.api'

const emit = defineEmits<{
	(e: 'add-success'): void
	(e: 'loading-change', loading: boolean): void
}>()
defineExpose({
	clearForm
})

const downloading = ref(false)
const uploading = ref(false)
const selectedFile = ref<File | null>(null)
const fileList = ref<UploadFile[]>([])
const uploadRef = ref<UploadInstance>()

// 下载JSON模板
const downloadTemplate = async () => {
	downloadJsonTemplate()
}

// 处理文件选择变化
const handleFileChange = (file: UploadFile, files: UploadFiles) => {
	if (files.length > 1) {
		fileList.value = [file] // 只保留最后一个选择的文件
	}

	selectedFile.value = file.raw || null
}

// 提交上传
const submitUpload = async () => {
	if (!selectedFile.value) {
		ElMessage.warning(t('kb.please.select.file'))
		return
	}

	try {
		uploading.value = true
		emit('loading-change', true) // 发送加载状态
		await importJsonKnowledge(selectedFile.value)
		ElMessage.success(t('common.success'))
		emit('add-success')
		// 清空文件选择
		fileList.value = []
		selectedFile.value = null
	} finally {
		uploading.value = false
		emit('loading-change', false) // 发送加载状态结束
	}
}

const handleFileRemove = () => {
	selectedFile.value = null
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return '0 Bytes'
	const k = 1024
	const sizes = ['Bytes', 'KB', 'MB', 'GB']
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function clearForm() {
	selectedFile.value = null
	fileList.value = []
	uploadRef.value?.clearFiles()
}
</script>

<style scoped lang="scss">
.json-template-form-container {
	padding: 20px;

	.download-template {
		text-align: center;

		p {
			margin-bottom: 15px;
			color: #606266;
		}
	}

	.upload-section {
		border: 1px dashed #d9d9d9;
		border-radius: 6px;
		padding: 20px;
		text-align: center;
	}

	.file-info {
		padding: 10px;
		background-color: #f5f7fa;
		border-radius: 4px;
		font-size: 14px;
	}

	.submit-btn-container {
		display: flex;
		justify-content: flex-end;
		margin-top: 10px;
	}
}
</style>
