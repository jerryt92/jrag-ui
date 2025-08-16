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
				<li
					class="menu-card-item"
					@click="hrefTo('/')"
				>
					{{t('homepage')}}
				</li>
				<li
					class="menu-card-item"
					@click="hrefTo('/chat/assistant')"
				>
					{{t('ai.assistant')}}
				</li>
				<hr/>
				<li
					class="menu-card-item"
					@click="hrefTo('/logout')"
				>
					{{t('logout')}}
				</li>
			</ul>
		</div>
	</div>
</template>
<script setup lang="ts">
import { t } from '@jrag/lib'
import { ref, onUnmounted, watch } from 'vue'

defineExpose({
		show
})

const emit = defineEmits(['show-change'])

const showMenuCard = ref(false)
const menuCardRef = ref<HTMLElement | null>(null)
const isClickOutsideEnabled = ref(false)

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
	if (!isClickOutsideEnabled.value) return
	if (menuCardRef.value && !menuCardRef.value.contains(event.target as Node)) {
		showMenuCard.value = false
		isClickOutsideEnabled.value = false
		document.removeEventListener('click', handleClickOutside)
	}
}

onUnmounted(() => {
	document.removeEventListener('click', handleClickOutside)
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
	background: color-mix(in srgb, var(--n-color-neutral-w), transparent 90%);
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
		color: var(--n-color-neutral-8);
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