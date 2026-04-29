<template>
	<div class="login-container">
		<el-form
			ref="loginForm"
			:model="loginData"
			:rules="rules"
			label-position="left"
			label-width="0px"
			class="login-form"
			@keyup.enter="handlePrimaryAction"
		>
			<div class="logo-container">
				<h2 class="logo-text">{{ t('ai.center.title') }}</h2>
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
				<el-button
					type="primary"
					:class="['submit-btn', { 'submit-btn--captcha': !captchaToken && !powLoading }]"
					:loading="powLoading || loading || challengeLoading"
					@click="handlePrimaryAction"
				>
					<template v-if="captchaToken">{{ t('login.submit') }}</template>
					<template v-else-if="powLoading">{{ t('login.verifying') }}</template>
					<template v-else>{{ t('login.click.captcha') }}</template>
				</el-button>
			</el-form-item>
		</el-form>

		<ElDialog
			v-model="captchaDialogShow"
			class="captcha-dialog"
			align-center
			:loading="loading"
			show-close
			@close="onCaptchaDialogClose"
			draggable
		>
			<SlipCaptcha
				ref="slideCaptchaRef"
				:loading="loading"
				@valid-pass="slideCaptchaSuccess"
			/>
		</ElDialog>
	</div>
</template>

<script setup lang="ts">
import axios from 'axios'
import { nextTick, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
	ElForm,
	ElFormItem,
	ElInput,
	ElButton,
	ElDialog,
	ElMessage
} from 'element-plus'
import type { FormInstance } from 'element-plus'
import {
	getPowCaptcha,
	verifyPowCaptcha,
	type PowCaptchaResp
} from '@/api/captcha.api'
import { getSessionInfo, login } from '@/api/login.api'
import SlipCaptcha from '@/pages/login/components/SlipCaptcha.vue'

import { t } from '@ai-system/lib'
import { setSessionInfo } from '@/utils/role'
import { solvePow } from '@/utils/pow'

const router = useRouter()
const loginForm = ref<FormInstance>()
const slideCaptchaRef = ref<{ updateSlideCaptcha: () => void }>()
const loading = ref<boolean>(false)
const powLoading = ref<boolean>(false)
const captchaDialogShow = ref<boolean>(false)
const powFailCount = ref(0)
const captchaToken = ref<{ code: string; hash: string } | null>(null)
const challengeData = ref<PowCaptchaResp | null>(null)
const challengeLoading = ref(false)

const loginData = reactive({
	username: '',
	password: ''
})

const rules = {
	username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
	password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

function onCaptchaDialogClose() {
	loading.value = false
}

function onPowVerifyFailed() {
	powFailCount.value += 1
	ElMessage.error(t('login.powFail'))
	if (powFailCount.value >= 3) {
		powFailCount.value = 0
		captchaDialogShow.value = true
		nextTick(() => {
			slideCaptchaRef.value?.updateSlideCaptcha()
		})
	}
}

async function loadPowChallenge() {
	if (challengeLoading.value) return
	challengeLoading.value = true
	try {
		const { data } = await getPowCaptcha()
		challengeData.value = data
	} catch (e) {
		console.error(e)
		challengeData.value = null
	} finally {
		challengeLoading.value = false
	}
}

async function runPowVerify() {
	if (!challengeData.value || powLoading.value || captchaToken.value) return
	powLoading.value = true
	const challenge = challengeData.value
	try {
		const powNonce = await solvePow(
			challenge.hash,
			challenge.powSalt,
			challenge.powDifficulty
		)
		if (powNonce === null) {
			onPowVerifyFailed()
			challengeData.value = null
			return
		}
		const verifyRes = await verifyPowCaptcha(challenge.hash, powNonce)
		if (verifyRes.data.result && verifyRes.data.code) {
			captchaToken.value = {
				code: verifyRes.data.code,
				hash: challenge.hash
			}
			powFailCount.value = 0
		} else {
			onPowVerifyFailed()
			challengeData.value = null
		}
	} catch (e) {
		console.error(e)
		ElMessage.error(t('login.powFail'))
		challengeData.value = null
	} finally {
		powLoading.value = false
	}
}

function slideCaptchaSuccess(e: { code: string; hash: string }) {
	captchaToken.value = { code: e.code, hash: e.hash }
	powFailCount.value = 0
	captchaDialogShow.value = false
	void submitLogin()
}

async function submitLogin() {
	if (!captchaToken.value) return
	const form = loginForm.value
	if (!form) return
	try {
		await form.validate()
	} catch {
		return
	}
	loading.value = true
	try {
		await login(
			loginData.username,
			loginData.password,
			captchaToken.value.code,
			captchaToken.value.hash
		)
		try {
			const sessionResponse = await getSessionInfo()
			setSessionInfo(sessionResponse.data)
			if (sessionResponse.data.role > 1) {
				router.push('/chat/assistant')
			} else {
				router.push('/')
			}
		} catch (error) {
			setSessionInfo(null)
			router.push('/')
		}
	} catch (e: unknown) {
		console.log(e)
		if (axios.isAxiosError(e) && e.response?.status === 401) {
			captchaDialogShow.value = false
			captchaToken.value = null
			challengeData.value = null
			ElMessage.error(t('login.fail'))
		}
	} finally {
		loading.value = false
	}
}

async function handlePrimaryAction() {
	if (captchaToken.value) {
		void submitLogin()
		return
	}
	const form = loginForm.value
	if (!form) return
	try {
		await form.validate()
	} catch {
		return
	}
	if (!challengeData.value) {
		await loadPowChallenge()
		if (!challengeData.value) return
	}
	void runPowVerify()
}
</script>
<style lang="scss" scoped>
.login-container {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100vh;

	.login-form {
		width: 380px;
		padding: 20px;
		background-color: rgba(255, 255, 255, 0.2);
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
		font-size: var(--n-font-size-4);
		font-weight: bold;
		color: var(--el-color-primary);
		margin: 0;
	}

	.title {
		margin-bottom: 20px;
		text-align: center;
	}

	.submit-btn {
		width: 100%;
		&:hover {
			transform: scale(1.01);
		}
	}
	.submit-btn--captcha {
		background: #fff;
		border-color: #fff;
		color: var(--el-color-primary);
	}
	:global(.login-container .el-dialog) {
		background: color-mix(in srgb, var(--n-color-neutral-w), transparent 90%);
	}
	:global(.login-container .captcha-dialog) {
		min-width: auto;
		width: auto;
		padding: 25px;
	}
}
</style>
