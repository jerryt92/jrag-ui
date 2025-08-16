import http from '@jrag/http/loginInterceptor'
import { KnowledgeGetListDto } from '@/api/kb/kb.model'

export const getKnowledge = (
	offset: number,
	limit: number
) => {
	return http.get<KnowledgeGetListDto>('/v1/rest/jrag/knowledge', {
		params: {
			offset,
			limit
		}
	})
}
