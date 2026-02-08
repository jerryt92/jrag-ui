export type MessageDto = {
	index: number
	role: 'assistant' | 'user' | 'system' | 'tool'
	content: string
	// 用户反馈: 0: 无, 1: 赞, 2: 踩
	feedback?: 0 | 1 | 2
	srcFile?: FileDto[]
}

export type FileDto = {
	fullFileName: string
	url: string
}

/**
 * 将FileDto数组转换为Markdown格式的字符串
 * @param srcFiles 源文件数组
 * @returns Markdown格式的字符串
 */
export const convertSrcFilesToMd = (files?: FileDto[]) => {
	if (!files || files.length === 0) {
		return ''
	}
	return files
		.map((file) => {
			return `- [${file.fullFileName}](${file.url})`
		})
		.join('\n')
}

export type ChatRequestDto = {
	// 上下文ID
	contextId: string
	messages: MessageDto[]
	// 是否检索知识库
	retrievalKb: boolean;
	// 系统提示词
	systemPrompt: 'GENERAL_ASSISTANT' | 'TOOL_USE';
}

export type MessageFeedbackRequest = {
	// 上下文ID
	contextId: string
	// 消息序号
	index: number
	// 用户反馈: 0: 无, 1: 赞, 2: 踩
	feedback: 0 | 1 | 2
}

export type ChatResponseDto = {
	message: MessageDto
	// 是否结束
	done: boolean
	// 上下文ID
	contextId: string
	// 错误标识
	error?: boolean
	errorCode?: string
	errorMessage?: string
}

export type WsResponse = {
	type: 'chat' | 'error'
	notice?: string
	chat?: ChatResponseDto
}

export type ContextIdDto = {
	// 上下文ID
	contextId: string
}

export type HistoryContextList = {
	data: HistoryContextItem[]
}

export type HistoryContextItem = {
	// 聊天上下文ID
	contextId: string
	// 标题
	tittle: string
	// 最后访问时间
	lastAccessTime: number
}

export type ChatContextDto = {
	// 聊天上下文ID
	contextId: string
	// 对话
	messages: MessageDto[]
}

export type QaTemplate = {
	data: {
		// 问题
		question: string
	}[]
}
