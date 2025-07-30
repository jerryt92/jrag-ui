/**
 * 生成4位ID
 * @returns
 */
export function s4() {
	return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
}

/**
 * 生成8位ID
 * @returns
 */
export function s8() {
	return s4() + s4()
}

export function hashCode(str: string): string {
	let hash = 0
	let i
	let chr
	if (str.length === 0) return `hash-${hash}`
	for (i = 0; i < str.length; i++) {
		chr = str.charCodeAt(i)
		hash = (hash << 5) - hash + chr
		hash |= 0
	}
	return `hash-${hash}`
}
