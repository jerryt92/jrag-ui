import http from '@ai-system/http/loginInterceptor'
import { globalUrlPrefix, programTag } from '@/oem.js'

export const getMcpConfig = () => {
	return http.get<Record<string, unknown>>(
		`/v1${globalUrlPrefix}rest/${programTag}/mcp/config`
	)
}

export const putMcpConfig = (config: Record<string, unknown>) => {
	return http.put<void>(
		`/v1${globalUrlPrefix}rest/${programTag}/mcp/config`,
		config
	)
}

export const getMcpStatus = () => {
	return http.get<Array<Record<string, unknown>>>(
		`/v1${globalUrlPrefix}rest/${programTag}/mcp/status`
	)
}
