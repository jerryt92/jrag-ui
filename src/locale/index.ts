import type { TranslatePair } from '@jrag/locale'

export const langLoader =  async (lang: string): Promise<TranslatePair> => {
	const localePath = `./lang/${lang}.js`

	let defaultLocaleRes = {}, broadbandLocalRes = {}, datacomLocaleRes = {}, datatechLocaleRes = {};
	if (import.meta.glob(`./lang/*.js`)[localePath] !== undefined){
		try {
			const module = await import(`./lang/${lang}.js`)
			defaultLocaleRes = module.default
		} catch (e){
			console.log(e)
			
		}
	}

	const langMap = {
		...defaultLocaleRes,
		...broadbandLocalRes,
		...datacomLocaleRes,
		...datatechLocaleRes
	}
	return langMap
}

export default async (lang) => {
	const langMap = await langLoader(lang);
	const message = {
		...langMap
	}
	return 	message
}
  