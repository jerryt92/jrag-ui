import {
	STORAGE_TOKEN_KEY,
	STORAGE_LANG_KEY,
	STORAGE_THEME_KEY,
	STORAGE_USER_KEY,
	STORAGE_NAV_KEY,
	STORAGE_PERMISSION_KEY,
	STORAGE_TABLE_COLUMN, STORAGE_SYS_TOKEN_KEY
} from './constants'

export function setStorageItem(key: string, value: any, session = false) {
	const storage = session ? sessionStorage : localStorage
	if (value !== null && value !== undefined) {
		storage.setItem(key, String(value))
	}
}

export function setTokenStorage(token: string | null | undefined) {
	setStorageItem(STORAGE_TOKEN_KEY, token)
}

export function getTokenStorage(): string {
	return localStorage.getItem(STORAGE_TOKEN_KEY) || ''
}

export function getSysTokenStorage(): string {
	return localStorage.getItem(STORAGE_SYS_TOKEN_KEY) || ''
}

export function removeTokenStorage() {
	localStorage.removeItem(STORAGE_TOKEN_KEY)
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

export function removeLangStorage() {
	localStorage.removeItem(STORAGE_LANG_KEY)
}

export function setThemeStorage(theme: string | null | undefined) {
	setStorageItem(STORAGE_THEME_KEY, theme)
}

export function getThemeStorage(): string | null {
	return localStorage.getItem(STORAGE_THEME_KEY)
}

export function removeThemeStorage() {
	localStorage.removeItem(STORAGE_THEME_KEY)
}

export function setUserStorage(user: string | null | undefined) {
	setStorageItem(STORAGE_USER_KEY, user)
}

export function getUserStorage(): string {
	return localStorage.getItem(STORAGE_USER_KEY) || ''
}

export function removeUserStorage() {
	localStorage.removeItem(STORAGE_USER_KEY)
}

export function setNavStorage(nav: any) {
	setStorageItem(STORAGE_NAV_KEY, JSON.stringify(nav))
}

export function getNavStorage(): any {
	return JSON.parse(localStorage.getItem(STORAGE_NAV_KEY))
}

export function removeNavStorage() {
	localStorage.removeItem(STORAGE_NAV_KEY)
}

export function setPermissionStorage(permission: any) {
	const owedAuthorities = permission.authorityOwn ? permission.authorityOwn : []
	const allAuthorities = permission.authorityAll ? permission.authorityAll : {}
	setStorageItem(STORAGE_PERMISSION_KEY, JSON.stringify(owedAuthorities))
	setStorageItem(STORAGE_PERMISSION_KEY + "_all", JSON.stringify(allAuthorities))
}

export function getPermissionStorage(): any {
	return JSON.parse(localStorage.getItem(STORAGE_PERMISSION_KEY))
}

export function getPermissionAllStorage(): any {
	return JSON.parse(localStorage.getItem(STORAGE_PERMISSION_KEY + "_all"))
}

export function removePermissionStorage() {
	localStorage.removeItem(STORAGE_PERMISSION_KEY)
	localStorage.removeItem(STORAGE_PERMISSION_KEY + "_all")
}

export function setTableColumnStorage(key: string, column: string) {
	const allSet = getTableColumnStorage() || {}
	allSet[key] = column
	setStorageItem(STORAGE_TABLE_COLUMN, JSON.stringify(allSet))
}

export function getTableColumnStorage(key?: string): any {
	const allSet = JSON.parse(localStorage.getItem(STORAGE_TABLE_COLUMN)) || {}
	return key ? allSet[key] : allSet
}

export function removeTableColumnStorage() {
	localStorage.removeItem(STORAGE_TABLE_COLUMN)
}
