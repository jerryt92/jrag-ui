import {
	ChatContextDto,
	ChatRequestDto,
	ContextIdDto,
	HistoryContextList,
	MessageFeedbackRequest
} from '@/types/ai.types'
import { SSE } from 'sse.js'
import http from '@jrag/http/loginInterceptor'

// 请求
export const chatSSEClientApi = (chatRequestDto: ChatRequestDto): SSE => {
	return new SSE('/v1/rest/jrag/chat', {
		headers: {
			'Content-Type': 'application/json'
		},
		method: 'POST',
		payload: JSON.stringify(chatRequestDto)
	})
}

/**
 * checkApCenterApi
 */
export const checkApCenterApi = () => {
	// 使用http发送请求，防止全局拦截器打印异常
	return http.get<{
		// 0 - 正常，1 - 连接异常，2 - 认证异常
		status: 0 | 1 | 2
		description: string
	}>(`/v1/rest/jrag/api/check`)
}
/**
 * 获取一个新的对话上下文ID
 */
export const getNewContextId = () => {
	return http.get<ContextIdDto>(`/v1/rest/jrag/context/id`)
}

/**
 * 获取历史对话列表
 */
export const getHistoryContextList = (offset?: number, limit?: number) => {
	return http.get<HistoryContextList>(`/v1/rest/jrag/context/list`, {
		params: {
			offset,
			limit
		}
	})
}

/**
 * 获取历史对话
 */
export const getHistoryContext = (contextId: string) => {
	return http.get<ChatContextDto>(`/v1/rest/jrag/context`, {
		params: {
			'context-id': contextId
		}
	})
}

/**
 * 添加消息反馈
 */
export const addMessageFeedback = (feedback: MessageFeedbackRequest) => {
	return http.post(`/v1/rest/jrag/context/message/feedback`, feedback)
}

/**
 * 删除历史对话
 */
export const deleteHistoryContext = (contextId: string | string[]) => {
	return http.delete(`/v1/rest/jrag/context`, {
		params: {
			'context-id': Array.isArray(contextId) ? contextId.join(',') : contextId
		}
	})
}

/**
 * 开启聊天保活ws通道
 * @param contextId
 */
export const openChatKeepAliveWsClient = (contextId: string) => {
	return new WebSocket(
		window.location.origin.replace('http', 'ws') +
		'/ws/jrag/chat/alive' +
		'?context-id=' +
		contextId
	)
}