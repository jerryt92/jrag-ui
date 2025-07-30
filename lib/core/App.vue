<template>
	<div class="web-app" :class="classObj">
		<el-config-provider :locale="elLocale">
			<router-view></router-view>
		</el-config-provider>
	</div>
</template>

<script lang="ts" setup>
import { ElConfigProvider } from 'element-plus'
import { useElementLocale } from '@jrag/hooks'
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router'

const { elLocale } = useElementLocale()

const route = useRoute()

const isScreen = ref(false)
watch(()=>route.hash, (newHash, oldHash) => {
	if (newHash && newHash.indexOf('big-screen') > -1){
		isScreen.value = true
	} else {
		isScreen.value = false
	}
})
const classObj = computed(()=>{
	return {
		isScreen: isScreen.value, // 是否大屏页面
	}
})
</script>

<style lang="scss">
.web-app {
	height: 100vh;
	&.isFullscreen{
		position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
		padding: 0;
		margin: 0;
	}
	&.isScreen{
		.content{
			margin: 0!important;
		}
	}
}
</style>
