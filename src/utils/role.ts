const ROLE_STORAGE_KEY = 'user-role'

export const setUserRole = (role: number | null) => {
	if (role === null || role === undefined || Number.isNaN(role)) {
		localStorage.removeItem(ROLE_STORAGE_KEY)
		return
	}
	localStorage.setItem(ROLE_STORAGE_KEY, String(role))
}

export const getUserRole = (): number | null => {
	const raw = localStorage.getItem(ROLE_STORAGE_KEY)
	if (!raw) {
		return null
	}
	const parsed = Number(raw)
	return Number.isNaN(parsed) ? null : parsed
}

export const hasRoleAccess = (requiredRole: number): boolean => {
	const role = getUserRole()
	if (role === null) {
		return false
	}
	return role <= requiredRole
}
