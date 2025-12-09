import http from '@jrag/http/loginInterceptor'

export const loadLoginMode = () => {
	getLoginModeApi().then(res => {
		localStorage.setItem('login-mode', res.data.mode);
	})
}

const getLoginModeApi = () => {
	return http.get<
		{
			mode: 'public' | 'user'
		}
	>('/v1/auth/jrag/mode')
}

export const getLoginMode = () => {
	return localStorage.getItem('login-mode')
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
