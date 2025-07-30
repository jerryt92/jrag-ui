import { isUndefined, isFunction } from '@jrag/utils'

export function memo(fn: (...args: any[]) => any): any {
	let cacheValue: any
	return () => {
		if (isUndefined(cacheValue)) {
			const args = Array.prototype.slice.apply(arguments)
			cacheValue = fn.apply(null, args)
		}
		return cacheValue
	}
}

export function wrapFunction<T extends Function>(fn?: T, fn1?: Function) {
	if (!isFunction(fn1)) {
		throw new Error('wrapFunction expect args type Function')
	}
	return function (...args: any[]) {
		// eslint-disable-next-line @typescript-eslint/no-invalid-this
		if (isFunction(fn)) fn.apply(this, [...args])
		// eslint-disable-next-line @typescript-eslint/no-invalid-this
		fn1.apply(this, [...args])
	}
}
