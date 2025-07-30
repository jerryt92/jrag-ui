import { isArray, pick } from './lodash'
/**
 * 格式对象为url query 模式
 * @param obj
 * @returns String
 */

export function parseUrlParam(obj: Record<string, any>): string {
	const url: string[] = []
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			url.push(`${key}=${encodeURIComponent(obj[key])}`)
		}
	}
	return url.join('&')
}
/**
 *  根据name获取当前url对应的参数
 *  url = '&key=value' => value
 *  默认值为defaultValue
 */
export function getUrlParam(name: string, url?: string) {
	if (!name) {
		return null
	}
	const search = url || document.location.href
	const pattern = new RegExp('[?&]' + name + '=([^&]*)', 'g')
	const matcher = pattern.exec(search)
	let param: string = ''
	if (null !== matcher) {
		try {
			param = decodeURIComponent(decodeURIComponent(matcher[1]))
		} catch (e) {
			try {
				param = decodeURIComponent(matcher[1])
			} catch (e) {
				param = matcher[1]
			}
		}
	}
	return param
}

/**
 * 获取url参数，返回参数集合
 * @param url 默认为 location.search
 * @returns
 */
export function getUrlParamObject(uri?: string) {
	const url = uri || location.href || ''
	const out = {}
	const regex = /([^?=&]+)=([^?=&]*)/g
	let mather
	while ((mather = regex.exec(url))) {
		let value = mather[2]
		try {
			value = decodeURIComponent(decodeURIComponent(value))
		} catch (error) {
			try {
				value = decodeURIComponent(value)
			} catch (error) {}
		}
		out[mather[1]] = value
	}
	return out
}

export function delUrlParam(url: string, ref: string) {
	// 如果不包括此参数
	if (url.indexOf(ref) === -1) {
		return url
	}
	const arr_url = url.split('?')
	const base = arr_url[0]
	const arr_param = arr_url[1].split('&')
	let index = -1
	for (let i = 0; i < arr_param.length; i++) {
		const paired = arr_param[i].split('=')
		if (paired[0] === ref) {
			index = i
			break
		}
	}
	if (index === -1) {
		return url
	} else {
		arr_param.splice(index, 1)
		return base + '?' + arr_param.join('&')
	}
}

// 删除指定参数
export function delUrlParams(url: string, delKeys: string | string[]) {
	const excludeKeys = isArray(delKeys) ? [...delKeys] : [delKeys]
	const paramObject = getUrlParamObject(url)
	const paramKeys = Object.keys(paramObject).sort()
	const finalKeys = paramKeys.filter((key) => !excludeKeys.includes(key))
	const finalParamObject = pick(paramObject, finalKeys)
	const finalParam = parseUrlParam(finalParamObject)
	const path = url.split('?')[0]
	return `${path}?${finalParam}`
}

export function addUrlParam(
	url: string,
	key: string,
	value: number | boolean | string
) {
	if (url.includes('?')) {
		return `${url}&${key}=${value}`
	}
	return `${url}?${key}=${value}`
}

export function addUrlParamObject(
	url: string,
	param: { [key: string]: number | boolean | string }
) {
	let uri = url
	for (const key in param) {
		if (Object.prototype.hasOwnProperty.call(param, key)) {
			uri = addUrlParam(uri, key, param[key])
		}
	}
	return uri
}

export function joinUrl(...args: any[]) {
	const urlPath = args.reduce((pre, path) => {
		const normalPath = path && path.startsWith('/') ? path : `/${path}`
		return pre + normalPath
	}, '')
	return urlPath.replace(/\/[\/]+/, '/')
}
