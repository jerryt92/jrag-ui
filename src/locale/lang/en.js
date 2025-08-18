import enAi from './chat/en-ai.js'
import enKb from './knowledgeBase/en-kb.js'

export default {
  'common.submit': 'Submit',
	'common.delete': 'Delete',
	'common.cancel': 'Cancel',
	'common.ok': 'OK',
	'common.system.options': 'System Options',
	'homepage': 'Homepage',
	'login.fail': 'Username or password error',
	'captcha.tip': 'Please slide the block to the right to log in',
	'captcha.validate.fail': 'verification failed',
	'logout': 'Logout',
	'dark.mode.light': 'Light',
	'dark.mode.dark': 'Dark',
	'dark.mode.auto': 'Auto',
	...enAi,
	...enKb,
}
