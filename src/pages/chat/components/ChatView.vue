<template>
	<div
		class="chat-container"
		:class="{ fullscreen: isFullscreen, 'is-mobile': isMobile }"
	>
		<ChatManage
			v-show="showChatManage || isFullscreen"
			ref="chatManageRef"
			:new-chat="newChat"
			:history-chat="historyChat"
			:curr-context-id="contextId"
			:message-context="messageContext"
			@show-chat-manage="(val) => (showChatManage = val)"
		/>
		<div
			v-if="!showChatManage || isFullscreen || (isMobile && !showChatManage)"
			class="chat-view"
		>
			<el-scrollbar ref="scrollbarRef" class="scroll" @scroll="checkScroll">
				<div class="message-init">
					<div class="ai-logo">
						<!--						<img src="/src/assets/ai-logo-b.png" />-->
						<span style="font-size: 100px">🤖</span>
					</div>
					<h2 class="title">{{ $t('ai.hi.assistant') }}</h2>
					<div class="sub-tip">{{ $t('ai.assistant.tips') }}</div>
				</div>
				<div v-if="messageContext?.length" class="message-list">
					<div
						v-for="(message, index) in messageContext"
						:key="index"
						class="message-row"
						:class="[message.role]"
					>
						<template v-if="message.role === 'assistant'">
							<div
								class="avatar-wrap"
								:class="[
									isWaiting && index === messageContext.length - 1
										? 'thinking-avatar'
										: ''
								]"
							>
								<el-avatar :size="50" class="ai-chat-logo">
									<!--									<img src="/src/assets/ai-logo-w.png" />-->
									<span style="font-size: 35px; margin: auto">🤖</span>
								</el-avatar>
							</div>
							<div class="message-content">
								<div
									v-html="
										md.render(
											message.content +
												(isWaiting && index === messageContext.length - 1
													? '...'
													: '')
										)
									"
								/>
								<div
									v-show="message.srcFile && message.srcFile.length > 0"
									class="src-file"
								>
									<br />
									<p>
										{{ $t('ai.source') }}
									</p>
									<div
										v-html="md.render(convertSrcFilesToMd(message.srcFile))"
									/>
								</div>
								<div v-show="message?.content && !isWaiting" class="support">
									<span
										class="iconfont"
										:class="{ yes: message.feedback === 1 }"
										@click="handleMsgFeedback(1, message)"
										>👍</span
									>
									<span
										class="iconfont"
										:class="{ no: message.feedback === 2 }"
										@click="handleMsgFeedback(2, message)"
										>👎</span
									>
								</div>
							</div>
						</template>
						<template v-else-if="message.role === 'user'">
							<div
								class="message-content"
								v-html="md.render(message.content)"
							></div>
							<div class="avatar-wrap">
								<el-avatar :size="50">
									<img src="/src/assets/avatar.png" />
								</el-avatar>
							</div>
						</template>
					</div>
				</div>
				<div
					v-if="!isAtBottom"
					class="scroll-to-bottom-button"
					@click="scrollToBottom"
				>
					<ElIcon>
						<ArrowDown />
					</ElIcon>
				</div>
			</el-scrollbar>
			<div class="chat-model">
				<!--				<ElButton-->
				<!--					type="default"-->
				<!--					round-->
				<!--					:class="{ active: chatType === 'function' }"-->
				<!--					@click="choseChatModel('function')"-->
				<!--				>-->
				<!--					<img src="/src/assets/icon-dengpao.svg" />{{ $t('xxx') }}-->
				<!--				</ElButton>-->
			</div>
			<div class="input-area">
				<ElInput
					v-model="inputMessage"
					class="chat-input"
					:placeholder="t('ai.input.placeholder')"
					type="textarea"
					:autosize="{ minRows: 5, maxRows: 10 }"
					:maxlength="1000"
					show-word-limit
					@keydown="handleKeydown"
					@input="handleInput"
					@keyup="handleKeyup"
				/>
				<ElButton
					type="primary"
					class="chat-button"
					:icon="Position"
					circle
					:disabled="!inputMessage?.length"
					@click="sendMessage()"
				></ElButton>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ArrowDown, Position } from '@element-plus/icons-vue'
import { nextTick, onMounted, ref } from 'vue'
import {
	ElIcon,
	ElScrollbar,
	ElButton,
	ElInput,
	ElAvatar,
	ElMessage,
	ElMessageBox
} from 'element-plus'
import MarkdownIt from 'markdown-it'
import ChatManage from './chatManage.vue'
import {
	ChatRequestDto,
	ChatResponseDto,
	convertSrcFilesToMd,
	MessageDto,
	WsResponse
} from '@/types/ai.types'
import { t } from '@jrag/lib'
import {
	addMessageFeedback,
	chatSSEClientApi,
	checkApCenterApi,
	getHistoryContext,
	getNewContextId
} from '@/api/ai.api'
import { SSE } from 'sse.js'

const md = new MarkdownIt({
	html: true, // 启用 HTML 标签解析
	linkify: true, // 自动识别网络链接
	typographer: true // 改善某些符号的显示效果
})

// 添加自定义渲染规则
md.renderer.rules.paragraph_open = function (tokens, idx) {
	return '<p style="line-height: var(--n-font-line-height-4);">'
}
// 添加新的渲染规则以确保链接在新窗口中打开
md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
	tokens[idx].attrPush(['target', '_blank']) // 添加 target="_blank"
	return self.renderToken(tokens, idx, options)
}

const showChatManage = ref(false)
const chatManageRef = ref(null)
const contextId = ref<string>()
const scrollbarRef = ref()
const isAtBottom = ref<boolean>(true)
const messageContext = ref<MessageDto[]>([])
const inputMessage = ref<string>('')

const isWaiting = ref<boolean>(false)
const isNewLlmResponse = ref<boolean>(true)

defineProps({
	isFullscreen: {
		type: Boolean,
		default: false
	},
	isMobile: {
		type: Boolean,
		default: false
	}
})
let chatSSEClient: SSE
const sendMessage = (msg?: string) => {
	if (!isWaiting.value) {
		if (msg) {
			inputMessage.value = msg
		}
		if (inputMessage.value.trim()) {
			isWaiting.value = true
			scrollToBottom()
			const message: MessageDto = {
				index: messageContext.value.length,
				content: inputMessage.value,
				role: 'user'
			}
			messageContext.value.push(message)
			inputMessage.value = ''
			const chatRequestDto: ChatRequestDto = {
				contextId: contextId.value,
				messages: messageContext.value
			}
			chatSSEClient = chatSSEClientApi(chatRequestDto)
			// 连接打开时的处理
			chatSSEClient.onopen = () => {
				if (isNewLlmResponse.value) {
					messageContext.value.push({
						index: messageContext.value.length,
						role: 'assistant',
						content: ''
					})
					isNewLlmResponse.value = false
				}
				scrollToBottom()
			}
			// 接收新消息通知
			chatSSEClient.onmessage = (event) => {
				try {
					const chatResponseDto: ChatResponseDto = JSON.parse(event.data)
					handleChatResponse(chatResponseDto)
				} catch (error) {
					console.error('解析SSE消息失败:', error)
				}
			}
			// 错误处理
			chatSSEClient.onerror = (error: any) => {
				if (error.responseCode === 401) {
					window.location.assign('/#/login')
				} else if (error.responseCode !== 0) {
					console.error(error)
					ElMessage.error(t('ai.assistant.service.unavailable'))
					isWaiting.value = false
					isNewLlmResponse.value = true
				}
			}
		}
	} else {
		ElMessage.info(t('ai.assistant.waiting'))
	}
}
// 处理响应
const handleChatResponse = (chatResponseDto: ChatResponseDto) => {
	checkScroll()
	if (isAtBottom.value) {
		scrollToBottom()
	}
	if (chatResponseDto.message?.role === 'system') {
		messageContext.value[messageContext.value.length - 1] =
			chatResponseDto.message
		messageContext.value.push({
			index: messageContext.value.length,
			role: 'assistant',
			content: ''
		})
	} else if (chatResponseDto.message?.role === 'assistant') {
		if (
			messageContext.value[messageContext.value.length - 1].index !==
			chatResponseDto.message.index
		) {
			console.error('消息index异常')
		}
		if (chatResponseDto.done === true) {
			// 对话结束
			messageContext.value[messageContext.value.length - 1].content +=
				chatResponseDto.message.content
			isWaiting.value = false
			isNewLlmResponse.value = true
			nextTick(() => {
				chatSSEClient.close()
			})
		} else {
			if (chatResponseDto.message.srcFile) {
				messageContext.value[messageContext.value.length - 1].srcFile =
					chatResponseDto.message.srcFile
			}
			if (chatResponseDto.message.content) {
				messageContext.value[messageContext.value.length - 1].content +=
					chatResponseDto.message.content
			}
		}
	}
}
// 滚动到底部
const scrollToBottom = () => {
	nextTick(() => {
		if (scrollbarRef.value) {
			scrollbarRef.value.wrapRef.scrollTo({
				top: scrollbarRef.value.wrapRef.scrollHeight,
				behavior: 'smooth'
			})
		}
	})
}

const checkScroll = () => {
	if (scrollbarRef.value) {
		const { scrollTop, scrollHeight, clientHeight } = scrollbarRef.value.wrapRef
		isAtBottom.value = scrollTop + 100 > scrollHeight - clientHeight
	}
}

let send: boolean = true

const handleKeydown = (event: KeyboardEvent) => {
	if (event.key === 'Enter' && !event.shiftKey) {
		send = true
		event.preventDefault()
	}
}

const handleInput = () => {
	send = false
}

const handleKeyup = () => {
	if (send) {
		send = false
		sendMessage()
	}
}

const handleMsgFeedback = (type, message?) => {
	message.feedback = type
	addMessageFeedback({
		contextId: contextId.value,
		index: message.index,
		feedback: type // 用户反馈: 0: 无, 1: 赞, 2: 踩
	}).then((res) => {
		if (type === 1) {
			ElMessage({
				message: t('ai.thank.support'),
				type: 'success'
			})
		}
		if (type === 2) {
			// todo
			ElMessage({
				message: t('ai.thank.feedback'),
				type: 'info'
			})
		}
	})
}

const newChat = () => {
	interruptChat()
	inputMessage.value = ''
	messageContext.value = []
	isAtBottom.value = true
	getNewContextId().then((contextIdDto) => {
		contextId.value = contextIdDto.data.contextId
	})
	scrollToBottom()
}

const historyChat = (historyId) => {
	interruptChat()
	inputMessage.value = ''
	if (historyId !== contextId.value) {
		chatManageRef.value.getHistoryListData()
	}
	contextId.value = historyId
	getHistoryContext(historyId).then((res) => {
		messageContext.value = res.data.messages
		scrollToBottom()
	})
}

// 中止正在进行的对话
const interruptChat = () => {
	isWaiting.value = false
	isNewLlmResponse.value = true
	if (chatSSEClient) {
		chatSSEClient.close()
	}
}

onMounted(() => {
	checkApCenterApi().then((res) => {
		if (res.status === 2) {
			ElMessageBox.alert(t('ai.api.key.invalid'), {
				type: 'error',
				message: t('ai.api.key.invalid.desc'),
				callback: () => {
					return
				}
			})
		} else {
			newChat()
		}
	})
})

defineExpose({
	showChatManage,
	chatManageRef,
	getHistoryListData: () => chatManageRef.value.getHistoryListData(),
	newChat
})
</script>
<style scoped lang="scss">
.chat-container {
	height: 100%;
	display: flex;
	flex-direction: column;
	position: relative;

	&.fullscreen {
		flex-direction: row;

		.chat-manage-view {
			width: 360px;
			max-width: 360px;
			height: 100%;

			:deep(.chat-list) {
				height: 100% !important;
				max-height: 100% !important;
			}
		}

		.chat-view {
			flex-grow: 1;
		}
	}

	.chat-view {
		display: flex;
		flex-direction: column;
		justify-content: center;
		height: 100%;
		padding: calc(2 * var(--n-padding-basic));

		.scroll {
			flex-grow: 1;
			height: 100%;
		}
	}
}

.ai-logo {
	width: 100px; // 固定宽度
	margin: 0 auto;

	img {
		width: 100%;
		height: 100%;
		object-fit: contain; // 保持图片比例
	}
}

.message-init {
	text-align: center;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	// margin: 20px auto;
	// width: 380px;
	padding: 20px 0;

	.title {
		font-size: 20px;
		color: #333;
		margin-top: 20px;
	}

	.sub-tip {
		font-size: 18px;
		color: #637a9e;
		line-height: 1.5;
		display: block;
		// width: 280px;
		margin: 20px 0 30px;
	}

	.hot-questions {
		display: flex;
		flex-direction: column;
		box-shadow: 0px 0px 12px var(--el-color-primary-light-7);
		// width: 350px;
		min-width: 350px;
		max-width: 450px;
		padding: 20px;
		border-radius: 15px;
		max-height: 300px;
		min-height: 160px;
		overflow: auto;
		background-color: #fff;

		.hot-questions-title {
			justify-content: space-between;
			margin-bottom: 15px;

			strong {
				.el-icon {
					margin-right: 2px;
				}
			}

			.change {
				color: var(--n-color-neutral-5);
				cursor: pointer;
				display: flex;
				justify-content: center;
				align-items: center;

				&:hover {
					color: var(--el-color-primary);
				}
			}
		}

		.question-list {
			display: flex;
			flex-direction: column;
			justify-content: center;

			.question {
				// display: flex;
				margin-bottom: 15px;
				cursor: pointer;
				line-height: 1.5;
				text-align: left;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				width: 100%;

				&:hover {
					color: var(--el-color-primary);
				}

				.qa {
					margin-right: 10px;
					height: 20px;
					line-height: 20px;
					color: var(--el-color-primary);
					font-family: auto;
					font-style: italic;
					background-color: var(--el-color-primary-light-9);
					display: inline-block;
					padding: 0 4px 0 2px;
					border-radius: 5px;
				}

				&:last-child {
					margin-bottom: 0;
				}
			}
		}
	}
}

.message-list {
	padding: 20px 0;

	.message-row {
		margin-bottom: 20px;
		display: flex;

		.message-content {
			max-width: 80%;
			padding: 10px 15px;
			border-radius: 15px;
			height: 100%;
			min-height: 48px;
			font-size: var(--n-font-size-2);
			word-wrap: break-word;
			word-break: break-all;
			justify-content: center;
			display: flex;
			flex-direction: column;
		}

		.message-content :deep(img) {
			max-width: 100%; /* 限制不超过父容器宽度 */
			height: auto; /* 保持原始比例 */
			display: block; /* 避免inline元素的底部间隙 */
		}

		&.assistant {
			.message-content {
				background-color: var(--el-color-primary-light-8); //#ffe0d1;
				border: 1px solid var(--el-color-primary-light-8);

				.src-file {
					margin-top: 15px;
					font-style: italic;
					font-size: var(--n-font-size-1);
				}

				.support {
					text-align: right;
					margin-top: 10px;

					.iconfont {
						cursor: pointer;
						margin-right: 15px;

						&:last-child {
							margin-right: 0;
						}

						&:hover,
						&.yes,
						&.no {
							color: var(--el-color-primary);
						}
					}
				}
			}
		}

		&.user {
			justify-content: flex-end;

			.message-content {
				background-color: #c3ddf7; //#cfe6fc;
			}
		}
	}
}

.chat-model {
	padding-bottom: 15px;

	.el-button {
		&.active {
			// background-color: var(--el-color-primary);
			// color: #fff;
			color: var(--el-color-primary);
			border-color: var(--el-color-primary);
			background-color: var(--el-color-primary-light-9);
		}

		img {
			height: 16px;
			margin-right: 5px;
		}
	}
}

.input-area {
	box-shadow: 0px 0px 12px var(--el-color-primary-light-7);
	overflow: visible;
	display: flex;
	padding: 0;
	border-radius: 15px;
	position: relative;

	.el-textarea {
		&.chat-input {
			:deep(textarea) {
				padding: 15px 20px;
				border-radius: 15px;
				word-wrap: break-word;
				word-break: break-all;

				:hover {
					box-shadow: none;
				}
			}

			:deep(.el-input__count) {
				right: 60px;
				bottom: 15px;
			}
		}
	}

	.el-button {
		position: absolute;
		right: 20px;
		bottom: 15px;
	}
}

// 思考动画
@keyframes thinking {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}

// 思考动画标志
.thinking-indicator {
	margin-top: 14px;
	margin-right: 10px;
	display: inline-block;
	width: 20px;
	height: 20px;
	border: 3px solid var(--el-color-primary-light-8);
	border-top-color: var(--el-color-primary);
	border-radius: 50%;
	animation: thinking 1s linear infinite;
	margin-left: 10px;
	flex-shrink: 0;
}

.avatar-wrap {
	margin: 0 10px;

	.el-avatar {
		margin: 0;
		flex-shrink: 0;
		width: 50px;
		height: 50px;
	}

	.ai-chat-logo {
		background-color: #282b33;
		padding: 8px 10px 12px;

		img {
			width: 100%;
			height: 100%;
			object-fit: contain; // 保持图片比例
		}
	}

	&.thinking-avatar {
		width: 50px;
		height: 50px;
		box-shadow: 0 0 12px var(--el-color-primary);
		background: linear-gradient(#9724ff, #00c4ff);
		border-radius: 50%;
		justify-content: center;
		display: flex;
		align-items: center;
		animation: thinking 1s linear infinite;

		.el-avatar {
			width: 42px;
			height: 42px;
			animation: anti-thinking 1s linear infinite;
		}

		.ai-chat-logo {
			padding: 7px 7px 10px;
		}
	}

	@keyframes thinking {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	@keyframes anti-thinking {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(-360deg);
		}
	}
}

/* Markdown样式 */
/* 标题 */
.message-content :deep(h1) {
	font-size: var(--n-font-size-6);
	margin-bottom: calc(var(--n-font-size-6) / 2);
}

.message-content :deep(h2) {
	font-size: var(--n-font-size-5);
	margin-bottom: calc(var(--n-font-size-5) / 2);
}

.message-content :deep(h3) {
	font-size: var(--n-font-size-4);
	margin-bottom: calc(var(--n-font-size-4) / 2);
}

.message-content :deep(h4) {
	font-size: var(--n-font-size-3);
	margin-bottom: calc(var(--n-font-size-3) / 2);
}

.message-content :deep(h5) {
	font-size: var(--n-font-size-2);
	margin-bottom: calc(var(--n-font-size-2) / 2);
}

.message-content :deep(h6) {
	font-size: var(--n-font-size-1);
	margin-bottom: calc(var(--n-font-size-1) / 2);
}

/* 有序列表 */
.message-content :deep(ol) {
	list-style: none; /* 移除默认的列表样式 */
	padding-left: calc(3 * var(--n-font-size-2));
}

.message-content :deep(ol li) {
	list-style: decimal;
}

/* 无序列表 */
.message-content :deep(ul) {
	padding-left: calc(3 * var(--n-font-size-2));
}

.message-content :deep(ul li) {
	list-style: disc;
}

/* 链接 */
.message-content :deep(a) {
	color: #2b6afd;
	text-decoration: none;
}

.message-content :deep(a:hover) {
	text-decoration: underline;
}

/* 代码 */
.message-content :deep(code) {
	background-color: #d4d4d4; /* 深色背景 */
	padding: 3px;
	border-radius: 4px;
	font-family: 'Courier New', Courier, monospace;
	white-space: pre-wrap; /* 保留空白符序列，但是正常地进行换行 */
	word-wrap: break-word; /* 在长单词或 URL 地址内部进行换行 */
}

.message-content :deep(pre) {
	background-color: #1e1e1e;
	color: #e0e0e0; /* 浅色文字 */
	padding: 1em;
	margin: 10px 0 10px 0;
	border-radius: 4px;
	overflow-x: auto;
	font-family: monospace;
}

.message-content :deep(pre code) {
	background-color: transparent;
	padding: 0;
}

.scroll-to-bottom-button {
	position: absolute;
	top: 95%;
	left: 50%;
	transform: translate(-50%, -50%);
	background-color: rgba(255, 255, 255, 0.7);
	backdrop-filter: blur(2px);
	border-radius: 50%;
	padding: 10px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	cursor: pointer;
}

@media only screen and (max-width: 768px) {
	.message-init {
		padding: 0 0 20px;
	}
}

/* 手机设备样式 */
@media only screen and (max-width: 600px) {
	.chat-input {
		height: 70px !important;

		:deep(textarea) {
			height: 70px !important;
			min-height: 70px !important;
		}
	}
	.message-init {
		padding: 0 0 20px;

		.ai-logo {
			width: 80px;
		}

		.title {
			font-size: 18px;
		}

		.sub-tip {
			font-size: 16px;
		}
	}
}
</style>
