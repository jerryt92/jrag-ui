import { FileDto } from '@/types/file.types'
import http from '@jrag/http/loginInterceptor'

export const uploadMarkdown = (file: File) => {
	const formData = new FormData()
	formData.append('file', file)
	return http.post<FileDto>('/v1/rest/jrag/knowledge/markdown', formData)
}
