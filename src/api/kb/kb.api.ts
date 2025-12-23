import http from '@ai-system/http/loginInterceptor'
import {
	KnowledgeAddDto,
	KnowledgeGetListDto,
	KnowledgeRetrieveResponseDto
} from '@/types/kb.model'
import { globalUrlPrefix, programTag } from '../../oem.js'

export const getKnowledge = (
	offset: number,
	limit: number,
	search?: string
) => {
	return http.get<KnowledgeGetListDto>(
		`/v1${globalUrlPrefix}rest/${programTag}/knowledge`,
		{
			params: {
				offset,
				limit,
				search
			}
		}
	)
}

export const retrieveKnowledge = (queryText: string, topK: number) => {
	return http.get<KnowledgeRetrieveResponseDto>(
		`/v1${globalUrlPrefix}rest/${programTag}/knowledge/retrieve`,
		{
			params: {
				'query-text': queryText,
				'top-k': topK
			}
		}
	)
}

export const deleteKnowledge = (textChunkIds: string[]) => {
	return http.post(
		`/v1${globalUrlPrefix}rest/${programTag}/knowledge/delete`,
		textChunkIds
	)
}

export const putKnowledge = (knowledgeList: KnowledgeAddDto[]) => {
	return http.put<void>(`/v1${globalUrlPrefix}rest/${programTag}/knowledge`, knowledgeList)
}

/**
 * 下载JSON模板
 */
export const downloadJsonTemplate = () => {
	window.open(`/v1${globalUrlPrefix}rest/${programTag}/knowledge/json-template`)
}

/**
 * 导入JSON数据
 */
export const importJsonKnowledge = (file: File): Promise<any> => {
	const formData = new FormData()
	formData.append('jsonTemplate', file)
	return http.post(
		`/v1${globalUrlPrefix}rest/${programTag}/knowledge/json-template`,
		formData
	)
}
