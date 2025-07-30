<template>
	<div class="uploader-container">
		<!-- 拖拽上传区域 -->
		<div class="drop-zone" @dragover="handleDragOver" @drop="handleDrop">
			<p>将文件拖拽至此区域上传</p>
			<p class="file-info">或</p>
			<input type="file" accept="image/*" @change="handleFileChange" />
		</div>
		<!-- 输入文件ID则表示覆盖文件 -->
		<p>
			<input
				type="number"
				style="width: 200px"
				v-model="fileId"
				placeholder="输入文件ID则表示覆盖文件"
				min="1"
			/>
		</p>
		<!-- 已选文件信息 -->
		<div v-if="file" class="file-info">
			<p>文件名：{{ fileName }}</p>
			<p>大小：{{ fileSize }}</p>
		</div>

		<!-- 错误提示 -->
		<div v-if="errorMessage" class="error-message">
			{{ errorMessage }}
		</div>
		<!-- 提交按钮 -->
		<button class="submit-button" :disabled="!file" @click="uploadFile">
			提交上传
		</button>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { putFileApi, uploadFileApi } from '@/api/file.api'
import { ElMessage } from 'element-plus'

const file = ref<File | null>(null)
const fileId = ref<number>()
const fileName = ref('未选择文件')
const fileSize = ref('')
const errorMessage = ref('')

// 文件选择处理
const handleFileChange = (event: Event) => {
	const target = event.target as HTMLInputElement
	if (target.files && target.files.length > 0) {
		const selectedFile = target.files[0]
		validateFile(selectedFile)
	}
}

// 拖拽上传区域处理
const handleDrop = (event: DragEvent) => {
	event.preventDefault()
	if (event.dataTransfer && event.dataTransfer.files.length > 0) {
		const droppedFile = event.dataTransfer.files[0]
		validateFile(droppedFile)
	}
}

const handleDragOver = (event: DragEvent) => {
	event.preventDefault()
}

// 文件校验
const validateFile = (selectedFile: File) => {
	// // 文件类型检查
	// if (!selectedFile.type.startsWith('image/')) {
	//   errorMessage.value = '仅支持图片文件'
	//   return
	// }
	//
	// // 文件大小检查（例如最大 5MB）
	// const maxSizeInBytes = 5 * 1024 * 1024
	// if (selectedFile.size > maxSizeInBytes) {
	//   errorMessage.value = '文件大小不能超过 5MB'
	//   return
	// }

	// 合法文件
	file.value = selectedFile
	fileName.value = selectedFile.name
	fileSize.value = `${(selectedFile.size / 1024).toFixed(2)} KB`
	errorMessage.value = ''
}

// 上传

const uploadFile = async () => {
	if (!file.value) {
		return
	}
	errorMessage.value = ''
	if (fileId.value) {
		putFileApi(fileId.value, file.value).then((res) => {
			ElMessage.info('文件上传成功')
		})
	} else {
		uploadFileApi(file.value).then((res) => {
			ElMessage.info('文件上传成功')
		})
	}
}
</script>

<style scoped lang="scss">
.uploader-container {
	padding: 20px;
	font-family: Arial, sans-serif;
}

.drop-zone {
	border: 2px dashed #ccc;
	border-radius: 8px;
	padding: 30px;
	text-align: center;
	background-color: #f9f9f9;
	transition: border-color 0.3s ease;

	&:hover {
		border-color: #888;
	}

	input[type='file'] {
		display: none;
	}

	p {
		margin: 0;
		color: #666;
	}

	.file-info {
		margin-top: 10px;
		font-size: 14px;
		color: #333;
	}
}

.file-info {
	margin-top: 15px;
	color: #333;
}

.error-message {
	margin-top: 10px;
	color: red;
	font-weight: bold;
}
</style>
