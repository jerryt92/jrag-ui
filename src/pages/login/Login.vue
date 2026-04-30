<template>
	<div class="login-container">
		<el-form
			ref="loginForm"
			:model="loginData"
			:rules="rules"
			label-position="left"
			label-width="0px"
			class="login-form"
			@keyup.enter="handleLoginClick"
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
				<div
					class="captcha-check-panel"
					:class="{
						'is-checked': !!captchaToken,
						'is-loading': powLoading || challengeLoading || captchaDialogShow,
						'is-disabled': loading
					}"
				>
					<div
						class="captcha-check-box"
						:class="{
							'is-checked': !!captchaToken,
							'is-disabled': loading || powLoading || challengeLoading || captchaDialogShow
						}"
						@click="handlePrimaryAction"
					></div>
					<div class="captcha-check-text">
						<template v-if="powLoading || challengeLoading || captchaDialogShow">{{
							t('login.verifying')
						}}</template>
						<template v-else>{{ t('login.check.captcha') }}</template>
					</div>
					<div class="captcha-brand">
						<div class="captcha-brand-icon">
							<span class="arc arc-primary"></span>
							<span class="arc arc-black"></span>
						</div>
						<span class="captcha-brand-text">CAPTCHA</span>
					</div>
				</div>
			</el-form-item>
			<el-form-item>
				<el-button
					type="primary"
					class="submit-btn"
					:loading="loading"
					:disabled="!captchaToken || powLoading || challengeLoading || captchaDialogShow"
					@click="handleLoginClick"
				>
					{{ t('login.submit') }}
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
	if (loading.value || powLoading.value || challengeLoading.value || captchaDialogShow.value) return
	if (captchaToken.value) return
	if (!challengeData.value) {
		await loadPowChallenge()
		if (!challengeData.value) return
	}
	void runPowVerify()
}

function handleLoginClick() {
	void submitLogin()
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

	.captcha-check-panel {
		display: flex;
		align-items: center;
		width: 100%;
		box-sizing: border-box;
		height: 68px;
		padding: 0 16px;
		border: 1px solid var(--el-border-color);
		border-radius: 6px;
		background-color: #f9f9f9;
		user-select: none;
		transition: border-color 0.2s ease;
	}

	.captcha-check-panel:hover {
		border-color: var(--el-color-primary);
	}

	.captcha-check-panel.is-disabled,
	.captcha-check-panel.is-loading {
		cursor: not-allowed;
		opacity: 0.75;
	}

	.captcha-check-box {
		width: 28px;
		height: 28px;
		border: 2px solid #b9b9b9;
		border-radius: 4px;
		background: #fff;
		position: relative;
		flex-shrink: 0;
		cursor: pointer;
	}

	.captcha-check-box.is-checked {
		border-color: #2e7d32;
	}

	.captcha-check-box.is-disabled {
		cursor: not-allowed;
	}

	.captcha-check-box.is-checked::after {
		content: '';
		position: absolute;
		left: 8px;
		top: 3px;
		width: 8px;
		height: 15px;
		border: solid #2e7d32;
		border-width: 0 3px 3px 0;
		transform: rotate(45deg);
	}

	.captcha-check-text {
		margin-left: 14px;
		font-size: 14px;
		color: var(--el-text-color-primary);
	}

	.captcha-brand {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 6px;
		color: #7a7f87;
	}

	.captcha-brand-icon {
		position: relative;
		width: 20px;
		height: 20px;
	}

	.captcha-brand-icon .arc {
		position: absolute;
		display: block;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		border: 2px solid transparent;
	}

	.captcha-brand-icon .arc-primary {
		left: 0;
		top: 0;
		border-top-color: var(--el-color-primary);
		border-left-color: var(--el-color-primary);
		transform: rotate(-8deg);
	}

	.captcha-brand-icon .arc-black {
		right: 0;
		bottom: 0;
		border-right-color: var(--n-color-neutral-b);
		border-bottom-color: var(--n-color-neutral-b);
		transform: rotate(-8deg);
	}

	.captcha-brand-text {
		font-size: 11px;
		letter-spacing: 0.3px;
		font-weight: 600;
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
