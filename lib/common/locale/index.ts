import type { TranslatePair } from '@ai-system/locale'
export const langLoader = async (lang: string): Promise<TranslatePair> => {
	const module = await import(`./lang/${lang}.js`)
	return module.default
}
