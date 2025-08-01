<template>
	<div class="login-container">
		<el-form
			ref="loginForm"
			:model="loginData"
			:rules="rules"
			label-position="left"
			label-width="0px"
			class="login-form"
			@keyup.enter="handleSubmit"
		>
			<div class="logo-container">
				<h2 class="logo-text">Jrag</h2>
			</div>
			<el-form-item prop="username">
				<el-input v-model="loginData.username" placeholder="用户名"></el-input>
			</el-form-item>
			<el-form-item prop="password">
				<el-input
					v-model="loginData.password"
					type="password"
					placeholder="密码"
				></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="handleSubmit" class="submit-btn">
					登录
				</el-button>
			</el-form-item>
		</el-form>
	</div>
	<ElDialog
		v-model="captchaDialogShow"
		class="captcha-dialog"
		align-center
		:loading="loading"
		show-close
		@close="loading = false"
	>
		<SlipCaptcha
			ref="slideCaptchaRef"
			:loading="loading"
			@valid-pass="slideCaptchaSuccess"
		/>
	</ElDialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElForm, ElFormItem, ElInput, ElButton, ElDialog } from 'element-plus'
import { login } from '@/api/login.api'
import SlipCaptcha from '@/pages/login/components/SlipCaptcha.vue'

const router = useRouter()
const slideCaptchaRef = ref()
const loading = ref<boolean>(false)
const captchaDialogShow = ref<boolean>(false)

// 表单数据
const loginData = reactive({
	username: '',
	password: ''
})

// 验证规则
const rules = {
	username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
	password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// 提交处理函数
const handleSubmit = () => {
	captchaDialogShow.value = true
}

const slideCaptchaSuccess = (e) => {
	login(loginData.username, loginData.password, e.code, e.hash).then(() => {
		router.push('/')
	})
}
</script>
<style lang="scss" scoped>
.login-container {
	background-image: url('@/assets/wallpaper.webp');
	background-size: cover;
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100vh;
	background-color: #f5f7fa;
}

.login-form {
	width: 400px;
	padding: 20px;
	background-color: rgba(255, 255, 255, 0.4);
	backdrop-filter: blur(12px);
	border-radius: 8px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	transition: transform 0.2s ease;
}

.login-form:hover {
	transform: scale(1.02);
}

.logo-container {
	text-align: center;
	margin-bottom: 20px;
}

.logo-text {
	font-size: 32px;
	font-weight: bold;
	color: #409eff;
	margin: 0;
}

.title {
	margin-bottom: 20px;
	text-align: center;
}

.submit-btn {
	width: 100%;
}

:global(.captcha-dialog) {
	width: auto;
	min-width: 0
}
</style>
