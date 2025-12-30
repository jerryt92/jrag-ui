import {
	ChatContextDto,
	ContextIdDto,
	HistoryContextList,
	MessageFeedbackRequest,
	QaTemplate
} from '@/types/ai.types'
import http from '@ai-system/http/loginInterceptor'
import { globalUrlPrefix, programTag } from '@/oem.js'

export const chatWebsocketClientApi = (contextId: string): WebSocket => {
	return new WebSocket(
		window.location.origin.replace('http', 'ws') +
		`/ws${globalUrlPrefix}rest/${programTag}/chat?context-id=` +
		contextId
	)
}

/**
 * 获取一个新的对话上下文ID
 */
export const getNewContextId = () => {
	return http.get<ContextIdDto>(`/v1${globalUrlPrefix}rest/${programTag}/context/id`)
}

/**
 * 获取历史对话列表
 */
export const getHistoryContextList = (offset?: number, limit?: number) => {
	return http.get<HistoryContextList>(`/v1${globalUrlPrefix}rest/${programTag}/context/list`, {
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
	return http.get<ChatContextDto>(`/v1${globalUrlPrefix}rest/${programTag}/context`, {
		params: {
			'context-id': contextId
		}
	})
}

/**
 * 添加消息反馈
 */
export const addMessageFeedback = (feedback: MessageFeedbackRequest) => {
	return http.post(
		`/v1${globalUrlPrefix}rest/${programTag}/context/message/feedback`,
		feedback
	)
}

/**
 * 删除历史对话
 */
export const deleteHistoryContext = (contextId: string | string[]) => {
	return http.delete(`/v1${globalUrlPrefix}rest/${programTag}/context`, {
		params: {
			'context-id': Array.isArray(contextId) ? contextId.join(',') : contextId
		}
	})
}

/**
 * 获取热门问题
 */
export const getQaTemplate = (limit?: number) => {
	return http.get<QaTemplate>(`/v1${globalUrlPrefix}rest/${programTag}/qa-template`, {
		params: {
			limit
		}
	})
}
