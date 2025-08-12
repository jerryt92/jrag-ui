import axios from 'axios'
import { ElMessage } from 'element-plus'

const http = axios.create({
	baseURL: '/',
	timeout: 5000
})

// 响应拦截器
http.interceptors.response.use(
	(response) => {
		// 可以在这里统一处理响应数据
		return response
	},
	(error) => {
		const { status } = error.response

		// 判断状态码是否为 401
		if (status === 401 || status === 403) {
			window.location.assign('/#/login')
		}

		// 抛出错误
		return Promise.reject(error)
	}
)

export default http
