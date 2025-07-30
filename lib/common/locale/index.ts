import type { TranslatePair } from '@jrag/locale'
export const langLoader = async (lang: string): Promise<TranslatePair> => {
	const module = await import(`./lang/${lang}.js`)
	return module.default
}
