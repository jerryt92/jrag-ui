import { getPermissionStorage, getPermissionAllStorage } from '@ai-system/utils'

interface PermissionApi {
	/**
	 * 当没有其中的任何一个权限时, 返回true
	 **/
	notHasAny(...requiredAuthorities: string[]): boolean
	/**
	 * 有其中的任何一个权限时, 返回true
	 **/
	hasAny(...requiredAuthorities: string[]): boolean
}

class PermissionImpl implements PermissionApi {
	hasAny(...requiredAuthorities: string[]): boolean {
		const ownAuthorities = getPermissionStorage()
		const allAuthPaths = getPermissionAllStorage()
		if (!requiredAuthorities || requiredAuthorities.length < 1) {
			return true
		}
		for (const i in requiredAuthorities) {
			let required = requiredAuthorities[i]
			let deep = false
			if (required.startsWith('deep(') && required.endsWith(')')) {
				deep = true
				required = required.substring('deep('.length, required.length - 1)
			}
			const requiredPath: string = allAuthPaths ? allAuthPaths[required] : ''
			if (!requiredPath) {
				continue
			}
			for (const j in ownAuthorities) {
				const owned = ownAuthorities[j]
				const ownedPath: string = allAuthPaths[owned]
				if (!ownedPath) {
					continue
				}
				if (requiredPath.includes('.' + owned + '.')) {
					return true
				} else if (deep && ownedPath.includes('.' + required + '.')) {
					return true
				}
			}
		}
		return false
	}
	notHasAny(...requiredAuthorities: string[]): boolean {
		return !this.hasAny(...requiredAuthorities)
	}
}

const perms = new PermissionImpl()

export { perms }
