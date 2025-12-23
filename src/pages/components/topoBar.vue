<template>
	<div class="top-bar">
		<h3 class="tittle" @click="goToHome">🤖 {{ topBarTittle }}</h3>
		<div class="menu-button-box">
			<slot name="external-menu"> </slot>
			<span
				class="menu-button"
				:class="{ active: menuActive }"
				@click="handleMenuCard"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="feather feather-menu"
				>
					<line x1="3" y1="12" x2="21" y2="12"></line>
					<line x1="3" y1="6" x2="21" y2="6"></line>
					<line x1="3" y1="18" x2="21" y2="18"></line>
				</svg>
			</span>
		</div>
	</div>
	<MenuCard
		ref="menuCardRef"
		class="menu-card"
		@show-change="showMenuCard = $event"
	/>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MenuCard from '@/pages/components/menuCard.vue'
import { topBarTittle } from '@/oem'

const showMenuCard = ref(false)
const menuCardRef = ref(null)

const goToHome = () => {
	window.location.href = '/'
}

const handleMenuCard = () => {
	menuCardRef.value.show()
}
</script>

<style lang="scss" scoped>
.top-bar {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	height: 50px;
	background: color-mix(in srgb, var(--n-color-neutral-w), transparent 80%);
	backdrop-filter: blur(10px);
	border: 1px solid rgba(255, 255, 255, 0.18);
	box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
	display: flex;
	align-items: center;
	justify-content: left;
	z-index: 100;

	.tittle {
		margin-left: 20px;
		font-size: 20px;
		font-weight: 500;
		color: var(--n-color-font-dark);
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		cursor: pointer;
	}

	.menu-button-box {
		position: absolute;
		display: flex;
		right: 0;

		.menu-button {
			font-size: 24px;
			margin-right: 5px;
			cursor: pointer;
			width: 36px;
			height: 36px;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #666;
			border-radius: 8px;
			transition: all 0.3s;

			&:hover {
				background-color: rgba(0, 0, 0, 0.05);
			}

			&.active {
				color: var(--el-color-primary);
				background-color: rgba(var(--el-color-primary-rgb), 0.1);
			}
		}
	}
}
.menu-card {
	position: fixed;
	top: 60px;
	right: 10px;
	z-index: 100;
}
</style>
