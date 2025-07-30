import { isNaN, toNumber, isArray, isEmpty } from './lodash'

export function transformNumber(value: any): number {
	const numberValue = toNumber(value)
	return isNaN(numberValue) ? 0 : numberValue
}

type DeepForeachCallBack = (
	item: any,
	level?: number,
	isLeaf?: boolean,
	parent?: any,
	index?: number
) => void
// 深层遍历树形数据
export function deepForEach(
	list: any[],
	callback: DeepForeachCallBack,
	level = 0,
	childKey = 'children',
	parent = null
) {
	level++
	for (let i = 0; i < list.length; i++) {
		const item = list[i]
		const children = item[childKey]
		const hasChildren = isArray(children) && !isEmpty(children)
		callback(item, level, !hasChildren, parent, i)
		if (hasChildren) {
			deepForEach(item[childKey], callback, level, childKey, item)
		}
	}
}

// 横岗写法转转小驼峰
export function lineToCamel(str: string, splitFlag = '-', isGreat?: boolean) {
	if (str.indexOf(splitFlag) === -1) return str
	const words = str.split(splitFlag).filter((w) => w && w.trim())
	return words
		.map((w, i) => {
			if (i > 0 || isGreat) {
				return w.charAt(0).toUpperCase() + w.substring(1)
			}
			return w
		})
		.join('')
}

// 路由路径转换为文件名
export function routePathToPageName(routePath: string) {
	return lineToCamel(`page/${routePath}`, '/', true)
}

/**
 * 将对象转为下拉选项数组格式
 * {1:'a', 2:'b'} => [{label: 'a', value: 1}, {label: 'b', value: 2}]
 * makeOptions(obj, 'name'): {1:{name:'a'}}, 2:{name:'b'}} => [{label: 'a', value: 1}, {label: 'b', value: 2}]
 */
export const makeOptions = (o: Record<string, any>, deepKey?: string) => {
	return Object.entries(o).map(([value, label]) => ({
		label: deepKey ? label[deepKey] : label,
		value: /^[0-9]*$/.test(value) ? Number(value) : value
	}))
}

// 对象数组 => 对象
export const arrayToMap = (
	arr: Record<string, any>[],
	key: string
): Record<string, any> => {
	return (
		arr?.reduce((data, item) => {
			data[item[key]] = item
			return data
		}, {}) || {}
	)
}

export function unpick<T extends Object, K extends keyof T>(
	obj: T,
	keys: Array<K>
) {
	const result = {} as Omit<T, K>
	const ks = Object.keys(obj) as unknown as Array<keyof T>
	for (let i = 0; i < ks.length; i++) {
		if (!keys.includes(ks[i] as K)) {
			const k = ks[i] as Exclude<keyof T, K>
			result[k] = obj[k]
		}
	}
	return result
}

const TYPE_DEFAULT_VALUE = {
	String: '',
	Boolean: false,
	Object: {},
	Array: []
}

// 根据类型设置默认值
export const getDefaultValueByType = (value: any) => {
	const originType = toString.call(value)
	const type = originType.slice(originType.indexOf(' ') + 1, -1)
	return TYPE_DEFAULT_VALUE[type]
}
