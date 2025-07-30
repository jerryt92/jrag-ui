import { ElMessageBox, ElMessage, ElLoading } from 'element-plus'
import { t } from '@jrag/locale'

class BaseFeedbackService {
	error(msg: string): void {
		ElMessage.error(msg)
	}
	success(msg: string): void {
		ElMessage.success(msg)
	}
	warning(msg: string): void {
		ElMessage.warning(msg)
	}
	info(msg: string): void {
		ElMessage.info(msg)
	}
	alert(msg: string): Promise<any> {
		return ElMessageBox.alert(msg)
	}
	loading(msg: string) {
		return ElLoading.service({
			text: msg
		})
	}
	confirm(
		msg: string,
		title: string = t('common.hint'),
		options?: {
			type?: '' | 'success' | 'warning' | 'info' | 'error'
			showCancel?: boolean
			confirmText?: string
			cancelText?: string
			showClose?: boolean
		}
	): Promise<any> {
		return ElMessageBox.confirm(msg, title, {
			type: options?.type,
			confirmButtonText: options?.confirmText || t('topo.confirm'),
			cancelButtonText: options?.cancelText || t('common.cancel'),
			showCancelButton: false,
			closeOnClickModal: false,
			closeOnPressEscape: false,
			closeOnHashChange: false
		})
	}
}
