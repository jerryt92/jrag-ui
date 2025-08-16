import zhAi from './chat/zh-ai.js'
import zhKb from './knowledgeBase/zh-kb.js'

export default {
  'common.submit': '提交',
	'common.delete': '删除',
	'common.cancel': '取消',
	'common.ok': '确定',
	'common.system.options': '系统菜单',
	'homepage': '首页',
	'login.fail': '用户名或密码错误',
	'captcha.tip': '请拖动滑块对齐图像以登录',
	'captcha.validate.fail': '验证失败',
	'logout': '退出登录',
	...zhAi,
	...zhKb,
}
