import http from '@ai-system/http/loginInterceptor'
import { globalUrlPrefix, programTag } from '@/oem.js'

export const login = (
	username: string,
	password: string,
	validateCode: string,
	hash: string
) => {
	return http.post(`/v1${globalUrlPrefix}auth/${programTag}/login`, {
		username,
		password,
		validateCode,
		hash
	})
}

export const logout = () => {
	return http.get(`/v1${globalUrlPrefix}auth/${programTag}/logout`)
}
