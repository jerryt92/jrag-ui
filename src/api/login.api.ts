import http from '@jrag/http/loginInterceptor'

export const login = (
	username: string,
	password: string,
	validateCode: string,
	hash: string
) => {
	return http.post('/v1/auth/jrag/login', {
		username,
		password,
		validateCode,
		hash
	})
}

export const logout = () => {
	return http.get('/v1/auth/jrag/logout')
}
