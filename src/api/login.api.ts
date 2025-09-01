import http from '@jrag/http/loginInterceptor'

export const getMode = () => {
	return http.get<
		{
			mode: 'public' | 'user'
		}
	>('/v1/auth/jrag/mode')
}

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
