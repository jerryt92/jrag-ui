import http from '@ai-system/http/loginInterceptor'
import { globalUrlPrefix, programTag } from '@/oem.js'

export type PropertyMap = Record<string, string>

export interface PropertyDto {
	propertyName: string
	propertyValue: string
}

export const getProperties = (propertyNames: string[]) => {
	return http.post<PropertyMap>(
		`/v1${globalUrlPrefix}rest/${programTag}/property/get`,
		propertyNames
	)
}

export const putProperties = (properties: PropertyDto[]) => {
	return http.put<void>(`/v1${globalUrlPrefix}rest/${programTag}/property`, properties)
}
