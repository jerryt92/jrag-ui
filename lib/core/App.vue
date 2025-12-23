<template>
	<div class="web-app" :class="classObj">
		<el-config-provider :locale="elLocale">
			<router-view></router-view>
		</el-config-provider>
	</div>
</template>

<script lang="ts" setup>
import { ElConfigProvider } from 'element-plus'
import { useElementLocale } from '@ai-system/hooks'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { t } from '@ai-system/lib'
document.getElementsByTagName('title')[0].innerHTML = t('ai.center.title')
const { elLocale } = useElementLocale()

const route = useRoute()

const isScreen = ref(false)
watch(
	() => route.hash,
	(newHash, oldHash) => {
		if (newHash && newHash.indexOf('big-screen') > -1) {
			isScreen.value = true
		} else {
			isScreen.value = false
		}
	}
)
const classObj = computed(() => {
	return {
		isScreen: isScreen.value // 是否大屏页面
	}
})
</script>

<style lang="scss">
.web-app {
	background-image: url('@/assets/wallpaper.svg'),
		linear-gradient(45deg, rgb(195, 195, 196) 0px, rgb(83, 83, 83) 100%);
	background-size: cover;

	position: relative;
	height: 100%;
	z-index: 0;
	// 添加遮罩层
	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(173, 214, 255, 0.5);
		z-index: -1;
	}
	&.isFullscreen {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
		padding: 0;
		margin: 0;
	}
	&.isScreen {
		.content {
			margin: 0 !important;
		}
	}
}

// 深色模式下的背景处理
html.dark {
	.web-app {
		&::before {
			background-color: rgba(0, 12, 30, 0.7);
		}
	}
}
</style>
