import { ref } from 'vue'
import type { Ref } from 'vue'
export type TranslatePair = {
	[key: string]: string | string[] | TranslatePair
}

// 语言加载器
export type LangLoader = (lang: string) => Promise<TranslatePair>

export interface LocaleI {
	// 注册语言加载器
	registerLangLoader(langLoaders: LangLoader | LangLoader[]): void
	// 使用语言
	use(lang: string): void
	// 翻译
	translate(lang: string): any
}

const pairCache: Map<string, TranslatePair> = new Map()

// 合并字典数据
function mergeLangPair(pairs: TranslatePair[]): TranslatePair {
	return pairs.reduce((result: TranslatePair, pair: TranslatePair) => {
		return { ...result, ...pair }
	}, {})
}

export class Locale implements LocaleI {
	private langLoaders: Set<LangLoader> = new Set()
	lang: Ref<string> = ref('') // 语言
	pair: Ref<TranslatePair> = ref({}) // 语言对应的配置
	// 注册语言加载器
	public registerLangLoader(langLoaders: LangLoader | LangLoader[]) {
		if (Array.isArray(langLoaders)) {
			langLoaders.forEach((loader: LangLoader) => this.langLoaders.add(loader))
		} else {
			this.langLoaders.add(langLoaders)
		}
	}
	// 设置
	public async use(lang: string, langMessage?: Record<string, any>) {
		// 字典数据缓存中有则从缓存中取
		if (pairCache.has(lang)) {
			const pair = pairCache.get(lang)
			pair && this.update(lang, pair)
		}
		if (langMessage && Object.keys(langMessage).length){
			this.update(lang, langMessage)
			pairCache.set(lang, langMessage)
		} else {
			const langLoadPromises: Promise<TranslatePair>[] = []
			this.langLoaders.forEach( (loader: LangLoader) => {
				const p =  loader(lang)
				langLoadPromises.push(p)
			})
			const pairs: TranslatePair[] = await Promise.all(langLoadPromises)
			const pair: TranslatePair = mergeLangPair(pairs)
			this.update(lang, pair)
			pairCache.set(lang, pair)
		}
	}

	private update(lang: string, pair: TranslatePair) {
		document.querySelector('html')!.setAttribute('lang', lang)
		this.lang.value = lang
		this.pair.value = pair || {}
	}

	// 翻译
	public translate(...args: any[]) {
		const [path, option, defaultValue] = args
		if (!path) {
			return path
		}
		let value
		let current: any = this.pair.value
		if (typeof current[path] === 'string') {
			return this.compile(current[path], option)
		}
		const keys = path.split('.')
		for (let i = 0, j = keys.length; i < j; i++) {
			const property = keys[i]
			value = current[property]
			if (!value) {
				return defaultValue || path
			} else if (i === j - 1) {
				return this.compile(value, option)
			} else {
				current = value
			}
		}
	}

	// 解析模板  {}
	compile(str: any, option: any) {
		if (!str || !option) {
			return str
		}
		if (typeof str !== 'string') {
			return str
		}
		return str.replace(/\{(\w+)\}/g, (_, key) => {
			return option[key]
		})
	}
}

/**
 * 国际化管理
 */
export const locale = new Locale()

/**
 * 暴漏给全局API
 * @param args [path, option, defaultValue]
 * @returns
 */
export const t = (...args: any[]) => {
	return locale.translate(...args)
}

export type T = (path: string, option?: object) => any
