<template>
	<div class="uploader-container">
		<div class="top-bar">
			<h3>🤖 Jrag AI</h3>
			<div class="menu-button-box">
				<span
					class="menu-button"
					:class="{ active: showMenuCard }"
					@click="handleMenuCard"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="feather feather-menu"
					>
						<line x1="3" y1="12" x2="21" y2="12"></line>
						<line x1="3" y1="6" x2="21" y2="6"></line>
						<line x1="3" y1="18" x2="21" y2="18"></line>
					</svg>
				</span>
			</div>
		</div>
		<MenuCard
			ref="menuCardRef"
			class="menu-card"
			@show-change="showMenuCard = $event"
		/>
		<!-- 拖拽上传区域 -->
		<div class="drop-zone" @dragover="handleDragOver" @drop="handleDrop">
			<p>将文件拖拽至此区域上传</p>
			<p class="file-info">或</p>
			<input type="file" accept="image/*" @change="handleFileChange" />
		</div>
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
import { uploadMarkdown } from '@/api/file.api'
import { ElMessage } from 'element-plus'
import MenuCard from '@/pages/components/menuCard.vue'

const file = ref<File | null>(null)
const fileId = ref<number>()
const fileName = ref('未选择文件')
const fileSize = ref('')
const errorMessage = ref('')
const menuCardRef = ref(null)
const showMenuCard = ref(false)
const handleMenuCard = () => {
	menuCardRef.value.show()
}

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
	// 检查文件后缀
	const allowedExtensions = ['md', 'zip', 'tar.gz', 'tar']
	const isValidExtension = allowedExtensions.some((ext) =>
		selectedFile.name.endsWith('.' + ext)
	)

	if (!isValidExtension) {
		errorMessage.value = '仅支持后缀为 md、zip、tar.gz、tar 的文件'
		return
	}

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
	uploadMarkdown(file.value).then((res) => {
		ElMessage.info('文件上传成功')
	})
}
</script>

<style scoped lang="scss">
.uploader-container {
	font-family: Arial, sans-serif;
	padding: 70px 20px 20px;

	.top-bar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 50px;
		background: color-mix(in srgb, var(--n-color-neutral-w), transparent 80%);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.18);
		box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
		display: flex;
		align-items: center;
		justify-content: left;
		z-index: 100;

		h3 {
			margin-left: 20px;
			font-size: 20px;
			font-weight: 500;
			color: var(--n-color-font-dark);
			text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		}

		.menu-button-box {
			position: absolute;
			display: flex;
			right: 0;
			.menu-button {
				font-size: 24px;
				margin-right: 5px;
				cursor: pointer;
				width: 36px;
				height: 36px;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #666;
				border-radius: 8px;
				transition: all 0.3s;

				&:hover {
					background-color: rgba(0, 0, 0, 0.05);
				}

				&.active {
					color: var(--el-color-primary);
					background-color: rgba(var(--el-color-primary-rgb), 0.1);
				}
			}
		}
	}
	.menu-card {
		position: fixed;
		top: 60px;
		right: 10px;
		z-index: 100;
	}
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
