import {
	ChatContextDto,
	ChatRequestDto,
	ContextIdDto,
	HistoryContextItem,
	HistoryContextList,
	MessageFeedbackRequest,
	QaTemplate
} from '@/types/ai.types'
import { SSE } from 'sse.js'
import http from '@jrag/http/loginInterceptor'
import { loginMode } from '@/main'

const localStorageKey = 'chatContext'

type ChatContextLocalStorage = {
	sort: string[]
	data: {
		[key: string]: ChatContextLocalStorageValue
	}
}

type ChatContextLocalStorageValue = {
	historyContextItem: HistoryContextItem
	chatContextDto: ChatContextDto
}

// 请求
export const storageChatContextApi = (chatContextDto: ChatContextDto) => {
	if (loginMode === 'public') {
		const item: ChatContextLocalStorageValue = {
			historyContextItem: {
				contextId: chatContextDto.contextId,
				title: '',
				lastUpdateTime: Date.now()
			},
			chatContextDto: chatContextDto
		}
		for (let i = 0; i < chatContextDto.messages.length; i++) {
			const message = chatContextDto.messages[i]
			if (message.role === 'user') {
				item.historyContextItem.title =
					message.content.length > 64
						? message.content.substring(0, 64)
						: message.content
				break
			}
		}
		let lsString = localStorage.getItem(localStorageKey)
		const ls: ChatContextLocalStorage = lsString
			? JSON.parse(lsString)
			: {
					sort: [],
					data: {}
			  }
		if (!ls.data[chatContextDto.contextId]) {
			ls.sort.unshift(chatContextDto.contextId)
		}
		ls.data[chatContextDto.contextId] = item
		localStorage.setItem(localStorageKey, JSON.stringify(ls))
	}
	return Promise.resolve()
}

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
	if (loginMode === 'public') {
		try {
			let lsString = localStorage.getItem(localStorageKey)
			const ls: ChatContextLocalStorage = lsString
				? JSON.parse(lsString)
				: {
						sort: [],
						data: {}
				  }
			const historyContextList: HistoryContextList = {
				data: []
			}
			ls.sort.forEach((id) => {
				historyContextList.data.push(ls.data[id].historyContextItem)
			})
			return Promise.resolve({
				data: historyContextList
			})
		} catch (e) {
			localStorage.removeItem(localStorageKey)
			return Promise.resolve({
				data: {
					data: []
				}
			})
		}
	} else {
		return http.get<HistoryContextList>(`/v1/rest/jrag/context/list`, {
			params: {
				offset,
				limit
			}
		})
	}
}

/**
 * 获取历史对话
 */
export const getHistoryContext = (contextId: string) => {
	if (loginMode === 'public') {
		let lsString = localStorage.getItem(localStorageKey)
		const ls: ChatContextLocalStorage = lsString
			? JSON.parse(lsString)
			: {
					sort: [],
					data: {}
			  }
		return Promise.resolve({
			data: ls.data[contextId]?.chatContextDto
		})
	} else {
		return http.get<ChatContextDto>(`/v1/rest/jrag/context`, {
			params: {
				'context-id': contextId
			}
		})
	}
}

/**
 * 添加消息反馈
 */
export const addMessageFeedback = (feedback: MessageFeedbackRequest) => {
	if (loginMode === 'user') {
		return http.post(`/v1/rest/jrag/context/message/feedback`, feedback)
	} else {
		return Promise.resolve()
	}
}

/**
 * 删除历史对话
 */
export const deleteHistoryContext = (contextId: string | string[]) => {
	if (loginMode === 'public') {
		let lsString = localStorage.getItem(localStorageKey)
		const ls: ChatContextLocalStorage = lsString
			? JSON.parse(lsString)
			: {
					sort: [],
					data: {}
			  }
		if (Array.isArray(contextId)) {
			contextId.forEach((id) => {
				delete ls.data[id]
				ls.sort = ls.sort.filter((exitId) => exitId !== id)
			})
		} else {
			delete ls.data[contextId]
			ls.sort = ls.sort.filter((exitId) => exitId !== contextId)
		}
		localStorage.setItem(localStorageKey, JSON.stringify(ls))
		return Promise.resolve()
	} else {
		return http.delete(`/v1/rest/jrag/context`, {
			params: {
				'context-id': Array.isArray(contextId) ? contextId.join(',') : contextId
			}
		})
	}
}

/**
 * 获取热门问题
 */
export const getQaTemplate = (limit?: number) => {
	return http.get<QaTemplate>(`/v1/rest/jrag/qa-template`, {
		params: {
			limit
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
