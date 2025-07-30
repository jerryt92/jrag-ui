import zh from 'element-plus/dist/locale/zh-cn'
import en from 'element-plus/dist/locale/en'
import { ref } from 'vue'
import { memo, getLangStorage } from '@jrag/utils'

const elLangs = {
	zh,
	en
}

export const useElementLocale = memo((lang: string) => {
	const localLang = getLangStorage()
	const elLocale = ref(localLang === 'zh' ? zh : en)
	const switchLang = (lang: string) => {
		elLocale.value = elLangs[lang] ?? zh
	}
	return {
		elLocale,
		switchLang
	}
})
