import axios from 'axios'
import { globalUrlPrefix, programTag } from '@/oem.js'

export interface PowCaptchaResp {
	hash: string
	powSalt: string
	powDifficulty: number
}

export function getPowCaptcha() {
	return axios.get<PowCaptchaResp>(
		`/v1${globalUrlPrefix}auth/${programTag}/captcha/pow`
	)
}

export function verifyPowCaptcha(hash: string, powNonce: string) {
	return axios.post<{ result: boolean; code?: string }>(
		`/v1${globalUrlPrefix}auth/${programTag}/captcha/pow/validate`,
		{ hash, powNonce }
	)
}
