import { FileDto } from '@/types/file.types'
import http from '@jrag/http/loginInterceptor'

export const uploadFileApi = (file: File) => {
	const formData = new FormData()
	formData.append('file', file)
	return http.post<FileDto>('/private/ai-center/file', formData)
}

export const putFileApi = (id: number, file: File) => {
	const formData = new FormData()
	formData.append('id', id.toString())
	formData.append('file', file)
	return http.put<FileDto>('/private/ai-center/file', formData)
}
