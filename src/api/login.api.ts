import http from '@jrag/http/loginInterceptor'

export const login = (username: string, password: string) => {
	return http.post('/v1/auth/jrag/login', {
		username,
		password
	})
}

export const logout = () => {
	return http.get('/v1/auth/jrag/logout')
}
