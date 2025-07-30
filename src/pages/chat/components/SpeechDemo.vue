<template>
	<div>
		<button @click="startRecognition">开始语音识别</button>
		<div>识别结果：{{ recognizedText }}</div>
		<button @click="speak">点击我说话</button>
		<div>
			<label>语速：<input type="range" v-model.number="rate" min="0.1" max="10" step="0.1" /></label>
			<label>音调：<input type="range" v-model.number="pitch" min="0" max="2" step="0.1" /></label>
			<label>音量：<input type="range" v-model.number="volume" min="0" max="1" step="0.1" /></label>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			recognizedText: '',
			text: '你好，欢迎来到语音提示功能演示！',
			rate: 1,
			pitch: 1,
			volume: 1
		};
	},
	methods: {
		startRecognition() {
			const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
			recognition.lang = 'zh-CN';
			recognition.onresult = (event) => {
				const transcript = event.results[0][0].transcript;
				this.recognizedText = transcript;
				this.text = `您说的是：${transcript}`;
				// this.speak();
			};
			recognition.start();
		},
		speak() {
			const utterance = new SpeechSynthesisUtterance(this.text);
			utterance.rate = this.rate;
			utterance.pitch = this.pitch;
			utterance.volume = this.volume;
			window.speechSynthesis.speak(utterance);
		}
	}
}
</script>
