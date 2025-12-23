import { onUnmounted, ref, watch } from 'vue'
import { memo } from '@ai-system/utils'

// 检查是否支持深色模式
const isDarkModeSupported = () => {
	return (
		window.matchMedia &&
		window.matchMedia('(prefers-color-scheme: dark)').matches !== undefined
	)
}

// 获取当前系统主题偏好
const getSystemTheme = () => {
	if (!isDarkModeSupported()) return 'light'
	return window.matchMedia('(prefers-color-scheme: dark)').matches
		? 'dark'
		: 'light'
}

// 设置页面主题class
const setThemeClass = (theme: string) => {
	const root = document.documentElement
	const isDark = theme === 'dark'

	// 添加或移除dark类名
	if (isDark) {
		root.classList.add('dark')
	} else {
		root.classList.remove('dark')
	}
}

export const useDarkMode = memo(() => {
	// 初始化主题，优先使用系统主题，其次使用存储的主题，最后默认为light
	const currentTheme = ref(getSystemTheme())

	// 监听系统主题变化
	if (isDarkModeSupported()) {
		const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
		const handleSystemThemeChange = (e: MediaQueryListEvent) => {
			currentTheme.value = e.matches ? 'dark' : 'light'
		}

		// 添加事件监听器
		darkModeMediaQuery.addEventListener('change', handleSystemThemeChange)

		// 组件卸载时移除监听器
		onUnmounted(() => {
			darkModeMediaQuery.removeEventListener('change', handleSystemThemeChange)
		})
	}

	// 监听主题变化并应用到页面
	watch(
		currentTheme,
		(newTheme) => {
			setThemeClass(newTheme)
		},
		{ immediate: true }
	)

	return {
		currentTheme,
		isDarkModeSupported,
		setThemeClass
	}
})
