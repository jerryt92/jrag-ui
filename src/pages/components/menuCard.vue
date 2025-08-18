<template>
	<div v-show="showMenuCard" ref="menuCardRef" class="menu-card-card">
		<div class="menu-card-card-header">
			<div class="menu-card-card-header-title">
				<div class="menu-card-card-header-title-text">
					<div class="menu-card-card-header-title-text-title">
						{{ t('common.system.options') }}
					</div>
				</div>
			</div>
		</div>
		<div class="menu-card-content">
			<ul class="menu-card-list">
				<hr />
				<li class="menu-card-item" @click="hrefTo('/')">
					{{ '🏠 ' + t('homepage') }}
				</li>
				<hr />
				<li class="menu-card-item" @click="hrefTo('/chat/assistant')">
					{{ '🤖 ' + t('ai.assistant') }}
				</li>
				<li class="menu-card-item" @click="hrefTo('/kb')">
					{{ '📚 ' + t('kb.knowledge.base') }}
				</li>
				<hr />
				<li class="menu-card-item" @click="toggleDarkMode">
					<span v-show="currentDarkMode === 'disabled'"
						>☀️ {{ t('dark.mode.light') }}</span
					>
					<span v-show="currentDarkMode === 'enabled'"
						>🌙 {{ t('dark.mode.dark') }}</span
					>
					<span v-show="currentDarkMode === 'auto'">🌓 {{ t('dark.mode.auto') }}</span>
				</li>
				<hr />
				<li class="menu-card-item" @click="hrefTo('/logout')">
					{{ '⏏️ ' + t('logout') }}
				</li>
			</ul>
		</div>
	</div>
</template>
<script setup lang="ts">
import { t } from '@jrag/lib'
import { ref, onUnmounted, watch, onMounted } from 'vue'

defineExpose({
	show
})

const emit = defineEmits(['show-change'])

const showMenuCard = ref(false)
const menuCardRef = ref<HTMLElement | null>(null)
const isClickOutsideEnabled = ref(false)
const currentDarkMode = ref<'enabled' | 'disabled' | 'auto'>('auto')

const initDarkMode = () => {
	const savedDarkMode = localStorage.getItem('dark-mode') as
		| 'enabled'
		| 'disabled'
		| 'auto'
		| null
	currentDarkMode.value = savedDarkMode || 'auto'
	applyDarkMode(currentDarkMode.value)
}

const applyDarkMode = (darkMode: 'enabled' | 'disabled' | 'auto') => {
	if (darkMode === 'auto') {
		const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)')
			.matches
			? 'enabled'
			: 'disabled'
		document.documentElement.classList.toggle(
			'dark',
			systemDarkMode === 'enabled'
		)
	} else {
		document.documentElement.classList.toggle('dark', darkMode === 'enabled')
	}
}

const toggleDarkMode = () => {
	const darkModes: Array<'enabled' | 'disabled' | 'auto'> = [
		'enabled',
		'disabled',
		'auto'
	]
	const currentIndex = darkModes.indexOf(currentDarkMode.value)
	const nextIndex = (currentIndex + 1) % darkModes.length
	currentDarkMode.value = darkModes[nextIndex]
	localStorage.setItem('dark-mode', currentDarkMode.value)
	applyDarkMode(currentDarkMode.value)
}

const handleSystemDarkModeChange = (e: MediaQueryListEvent) => {
	if (currentDarkMode.value === 'auto') {
		document.documentElement.classList.toggle('dark', e.matches)
	}
}

function show() {
	showMenuCard.value = !showMenuCard.value
	if (showMenuCard.value) {
		setTimeout(() => {
			isClickOutsideEnabled.value = true
			document.addEventListener('click', handleClickOutside)
		}, 0)
	}
}

const handleClickOutside = (event: MouseEvent) => {
	if (!isClickOutsideEnabled.value) {
		return
	}
	if (menuCardRef.value && !menuCardRef.value.contains(event.target as Node)) {
		showMenuCard.value = false
		isClickOutsideEnabled.value = false
		document.removeEventListener('click', handleClickOutside)
	}
}

onMounted(() => {
	initDarkMode()
	window.matchMedia('(prefers-color-scheme: dark)')
		.addEventListener('change', handleSystemDarkModeChange)
})

onUnmounted(() => {
	document.removeEventListener('click', handleClickOutside)
	window
		.matchMedia('(prefers-color-scheme: dark)')
		.removeEventListener('change', handleSystemDarkModeChange)
})

watch(showMenuCard, (newValue) => {
	emit('show-change', newValue)
})

const hrefTo = (path) => {
	window.location.href = '/#' + path
}
</script>
<style lang="scss" scoped>
.menu-card-card {
	background: color-mix(in srgb, var(--n-color-neutral-w), transparent 50%);
	backdrop-filter: blur(10px);
	border-radius: var(--n-radius-quadruple);
	border: 1px solid
		color-mix(in srgb, var(--n-color-neutral-4), transparent 50%);
	box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
	display: flex;
	flex-direction: column;
	padding: 20px;
	position: fixed;
	top: 20px;
	right: 20px;
	width: 250px;
	max-height: 80vh;
	z-index: 1000;

	.menu-card-card-header-title-text-title {
		padding-left: var(--n-padding-basic);
		font-size: 18px;
		font-weight: bold;
		color: var(--n-color-neutral-b);
		margin-bottom: 15px;
	}

	.menu-card-content {
		flex: 1;
	}

	.menu-card-list {
		list-style: none;
		padding: 0;
		margin: 0;
		hr {
			border: none;
			height: 1px;
			background-color: var(--n-color-neutral-5);
			margin: 4px 0;
		}
	}

	.menu-card-item {
		color: var(--n-color-font-dark);
		cursor: pointer;
		border-radius: var(--n-radius-triple);
		padding: var(--n-padding-basic);

		&:last-child {
			border-bottom: none;
		}

		&:hover {
			background-color: var(--el-color-primary);
		}
	}
}
</style>
