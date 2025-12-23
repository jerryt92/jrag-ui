import { FileDto } from '@/types/file.types'
import http from '@ai-system/http/loginInterceptor'
import { programTag } from '@/oem.js'

export const uploadFileApi = (file: File) => {
	const formData = new FormData()
	formData.append('file', file)
	return http.post<FileDto>(`/private/${programTag}/file`, formData)
}

export const putFileApi = (id: number, file: File) => {
	const formData = new FormData()
	formData.append('id', id.toString())
	formData.append('file', file)
	return http.put<FileDto>(`/private/${programTag}/file`, formData)
}
