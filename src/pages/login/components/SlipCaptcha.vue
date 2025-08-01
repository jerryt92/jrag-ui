<template>
	<div v-loading="isLoading" class="slider-container">
		<div class="slider-canvas" @click="updateSlideCaptcha">
			<!-- 大图 -->
			<div
				ref="puzzle"
				class="puzzle-image"
				:style="{
					backgroundImage: `url(${slideInfo.puzzleUrl})`,
					width: '100%',
					height: '100%',
					position: 'absolute',
					top: 0,
					left: 0,
					backgroundSize: 'cover'
				}"
			/>
			<!-- 滑块 -->
			<div
				ref="block"
				class="slider-block"
				:style="{
					backgroundImage: `url(${slideInfo.sliderUrl})`,
					width: slideInfo.sliderSize + 'px',
					height: slideInfo.sliderSize + 'px',
					top: slideInfo.blockY + 'px',
					left: '0px',
					position: 'absolute',
					backgroundSize: 'cover'
				}"
			/>
			<!-- 结果遮罩层 -->
			<div
				:class="`result-mask ${resultMask.class}`"
				:style="{ height: `${resultMask.height}px` }"
			/>
		</div>
		<!-- 拖动的滑块内容 -->
		<div class="slider-square">
			<div class="box">
				<div
					class="slider-square-icon"
					:style="{ transform: `translateX(${slideInfo.sliderLeft}px)` }"
					@mousedown="sliderDown"
					@touchstart="sliderDown"
				></div>
				<span>{{ slideInfo.sliderText }}</span>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, onDeactivated, watch } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { t } from '@jrag/lib'

const isLoading = ref(false)

const props = withDefaults(defineProps<{
	loading: boolean;
}>(), {
	loading: false
})

watch(() => props.loading, (newVal) => {
	isLoading.value = newVal
})

// 定义 emits
const emit = defineEmits<{
	(
		e: 'validPass',
		value: {
			hash: string
			code: string
		}
	): void
}>()

defineExpose({
	updateSlideCaptcha
})

const puzzle = ref(null)
const block = ref(null)

const slideInfo = ref({
	hash: '',
	puzzleUrl: '',
	width: 300,
	height: 150,
	sliderUrl: '',
	sliderSize: 0,
	sliderY: 0,
	sliderLeft: 0,
	blockX: 0,
	blockY: 0,
	scaleRatio: 1,
	sliderText: ''
})

const origin = reactive({
	originX: 0
})

const resultMask = reactive({
	class: '',
	height: 0
})

onMounted(() => {
	bindEvents()
	updateSlideCaptcha()
})

function updateSlideCaptcha() {
	isLoading.value = true
	// 重置时使用 transform 保持性能
	block.value.style.transform = 'translate3d(0, 0, 0)'
	slideInfo.value.sliderLeft = 0
	updateSlideInfo().then(() => {
		slideInfo.value.sliderText = t('captcha.tip')
		resultMask.height = 0
		resultMask.class = ''
		slideInfo.value.sliderLeft = 0
		if (block.value) {
			block.value.style.left = '0'
		}
		// 重新计算缩放比例
		if (puzzle.value) {
			const puzzleRect = puzzle.value.getBoundingClientRect()
			slideInfo.value.scaleRatio = puzzleRect.width / slideInfo.value.width
			slideInfo.value.sliderY = slideInfo.value.sliderY * slideInfo.value.scaleRatio
			slideInfo.value.sliderSize = slideInfo.value.sliderSize * slideInfo.value.scaleRatio
		}
	}).finally(() => {
		isLoading.value = false
	})
}

function updateSlideInfo() {
	return axios.get<{
		hash: string
		puzzleUrl: string
		width: number
		height: number
		sliderUrl: string
		sliderSize: number
		sliderY: number
	}>('/v1/auth/captcha/slide?' + new Date().getTime())
		.then((res) => {
			slideInfo.value.hash = res.data.hash
			slideInfo.value.puzzleUrl = res.data.puzzleUrl
			slideInfo.value.width = res.data.width
			slideInfo.value.height = res.data.height
			slideInfo.value.sliderUrl = res.data.sliderUrl
			slideInfo.value.sliderSize = res.data.sliderSize
			slideInfo.value.sliderY = res.data.sliderY
			slideInfo.value.blockY = slideInfo.value.sliderY
		})
}

function verifySlideCaptcha(sliderX: number, hash: string) {
	return axios.get<{
		result: boolean
		code: string
	}>('/v1/auth/captcha/slide/validate', {
		params: {
			'slider-x': sliderX,
			hash
		}
	})
}

const slider = ref(false)

const sliderDown = (e) => {
	slider.value = true
	slideInfo.value.sliderText = ''
	origin.originX = e.pageX || e.touches?.[0]?.pageX
	// 预提示浏览器准备动画优化
	block.value.style.willChange = 'transform'
	e.preventDefault()
}

const sliderMove = (e) => {
	if (!slider.value) return
	const clientX = e.pageX || e.touches?.[0]?.pageX
	if (!clientX) return
	const moveX = clientX - origin.originX
	const maxMoveX =
		(slideInfo.value.width - slideInfo.value.sliderSize) *
		slideInfo.value.scaleRatio
	// 使用更精确的边界限制
	const clampedX = Math.max(0, Math.min(moveX, maxMoveX))
	// 使用transform和translate3d强制硬件加速
	block.value.style.transform = `translate3d(${clampedX}px, 0, 0)`
	slideInfo.value.sliderLeft = clampedX
	e.preventDefault()
}

const sliderUp = () => {
	if (!slider.value) return
	slider.value = false
	// 使用 will-change 预提示浏览器优化
	block.value.style.willChange = 'auto'
	const resultX = slideInfo.value.sliderLeft / slideInfo.value.scaleRatio
	verifySlideCaptcha(resultX, slideInfo.value.hash).then((res) => {
		if (res.data.result) {
			emit('validPass', {
				hash: slideInfo.value.hash,
				code: res.data.code
			})
		} else {
			ElMessage.error(t('captcha.validate.fail'))
			updateSlideCaptcha()
		}
	})
}

const bindEvents = () => {
	document.addEventListener('mousemove', sliderMove)
	document.addEventListener('mouseup', sliderUp)
	document.addEventListener('touchmove', sliderMove, { passive: false })
	document.addEventListener('touchend', sliderUp)
}

onDeactivated(() => {
	document.removeEventListener('mousemove', sliderMove)
	document.removeEventListener('mouseup', sliderUp)
	document.removeEventListener('touchmove', sliderMove)
	document.removeEventListener('touchend', sliderUp)
})
</script>

<style lang="scss">
.slider-container {
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: center;
	width: 100%;
	height: auto;
	margin: 0 auto;
	padding: 16px;
	border-radius: 4px;
	background: #fff;
	border: 1px solid #ebeef5;
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

	.slider-canvas {
		position: relative;
		background-color: transparent;
		margin-bottom: 16px;
		width: 360px;
		height: 270px;
		.puzzle-image {
			border-radius: 4px;
		}

		.slider-block {
			z-index: 2;
			border-radius: 4px;
			will-change: transform;
			backface-visibility: hidden;
			transform: translateZ(0);
		}
	}

	@keyframes result-show {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 0.7;
		}
	}

	.result-mask {
		position: absolute;
		left: 0;
		bottom: 0;
		width: 100%;
		opacity: 0.7;

		&.success {
			background-color: #52ccba;
			animation: result-show 1s;
		}

		&.fail {
			background-color: #f57a7a;
			animation: result-show 1s;
		}
	}
}

.slider-square {
	background-color: #f7f9fa;
	height: 36px;
	text-align: center;
	line-height: 36px;
	border: 1px solid #ddd;
	position: relative;
	border-radius: 4px;
	z-index: 10;

	.box {
		padding: 0 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		height: 100%;

		span {
			flex: 1;
			text-align: center;
			color: #666;
			font-size: 14px;
		}
	}

	.slider-square-icon {
		position: absolute;
		top: 0;
		left: 0;
		height: 35px;
		width: 35px;
		background-color: #fff;
		box-shadow: var(--el-color-primary) 0 0 1px 2px;
		cursor: pointer;
		z-index: 11;
		user-select: none;
		will-change: transform;

		&:hover {
			background-color: var(--el-color-primary);
		}

		&:active {
			background-color: var(--el-color-primary);
		}
	}
}
</style>