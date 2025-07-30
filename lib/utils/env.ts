export function isLocalEnvironment() {
	return /localhost/.test(location.host)
}
export function isDevEnvironment() {
	return /dev\./.test(location.host)
}

export function isProdEnvironment() {
	return !isDevEnvironment() && !isLocalEnvironment()
}

// // 是否在微环境下
// export const isMicro = (): boolean => {
// 	return (
// 		!!window.__MICRO_APP_ENVIRONMENT__ ||
// 		!!window.__MICRO_APP_BASE_APPLICATION__
// 	)
// }

// // 是否是子应用在微环境下
// export const isChildMicro = (): boolean => {
// 	return !!window.__MICRO_APP_ENVIRONMENT__
// }

// // 是否是主应用
// export const isBaseMicro = (): boolean => {
// 	return !!window.__MICRO_APP_BASE_APPLICATION__
// }

// // 子应用名称
// export const getChildMicroName = (): string | undefined => {
// 	return window.__MICRO_APP_NAME__
// }
