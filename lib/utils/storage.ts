import { STORAGE_LANG_KEY, STORAGE_PERMISSION_KEY } from './constants'

export function setStorageItem(key: string, value: any, session = false) {
	const storage = session ? sessionStorage : localStorage
	if (value !== null && value !== undefined) {
		storage.setItem(key, String(value))
	}
}
export function setLangStorage(lang: string | null | undefined) {
	const oldValue = getLangStorage()
	if (!oldValue || oldValue !== lang) {
		setStorageItem(STORAGE_LANG_KEY, lang)
	}
}

export function getLangStorage(): string | null {
	return localStorage.getItem(STORAGE_LANG_KEY)
}

export function getPermissionStorage(): any {
	return JSON.parse(localStorage.getItem(STORAGE_PERMISSION_KEY))
}

export function getPermissionAllStorage(): any {
	return JSON.parse(localStorage.getItem(STORAGE_PERMISSION_KEY + "_all"))
}