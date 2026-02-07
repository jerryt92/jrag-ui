<template>
	<div class="user-management">
		<div class="user-management-header">
			<el-button type="primary" @click="openCreateDialog">
				{{ t('user.management.create') }}
			</el-button>
			<el-button @click="loadUsers">
				{{ t('common.refresh') }}
			</el-button>
		</div>

		<el-table :data="users" v-loading="loading" stripe>
			<el-table-column prop="username" :label="t('user.management.username')" />
			<el-table-column prop="role" :label="t('user.management.role')">
				<template #default="{ row }">
					<el-select
						v-if="canEditRole(row)"
						v-model="row.role"
						size="small"
						@change="() => saveRole(row)"
					>
						<el-option
							v-for="roleOption in roleOptions"
							:key="roleOption.value"
							:label="roleOption.label"
							:value="roleOption.value"
						/>
					</el-select>
					<span v-else class="role-label">
						{{ getRoleLabel(row.role) }}
					</span>
				</template>
			</el-table-column>
			<el-table-column :label="t('common.action')" width="240">
				<template #default="{ row }">
					<el-button
						size="small"
						@click="openResetPassword(row)"
						:disabled="!canResetPassword(row)"
					>
						{{ t('user.management.reset.password') }}
					</el-button>
					<el-button
						size="small"
						type="danger"
						:disabled="isDeleteDisabled(row)"
						@click="confirmDelete(row)"
					>
						{{ t('common.delete') }}
					</el-button>
				</template>
			</el-table-column>
		</el-table>

		<el-dialog v-model="createDialogVisible" :title="t('user.management.create')">
			<el-form :model="createForm" label-width="90px" autocomplete="off">
				<el-form-item :label="t('user.management.username')">
					<el-input v-model="createForm.username" autocomplete="off" />
				</el-form-item>
				<el-form-item :label="t('user.management.password')">
					<el-input
						v-model="createForm.password"
						type="password"
						autocomplete="new-password"
						show-password
					/>
				</el-form-item>
				<el-form-item :label="t('user.management.role')">
					<el-select v-model="createForm.role" :disabled="!isAdmin">
						<el-option
							v-for="roleOption in roleOptions"
							:key="roleOption.value"
							:label="roleOption.label"
							:value="roleOption.value"
						/>
					</el-select>
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="createDialogVisible = false">
					{{ t('common.cancel') }}
				</el-button>
				<el-button type="primary" :loading="saving" @click="handleCreate">
					{{ t('common.ok') }}
				</el-button>
			</template>
		</el-dialog>

		<el-dialog v-model="passwordDialogVisible" :title="t('user.management.reset.password')">
			<el-form :model="passwordForm" label-width="90px" autocomplete="off">
				<el-form-item :label="t('user.management.password')">
					<el-input
						v-model="passwordForm.password"
						type="password"
						autocomplete="new-password"
						show-password
					/>
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="passwordDialogVisible = false">
					{{ t('common.cancel') }}
				</el-button>
				<el-button type="primary" :loading="saving" @click="handleResetPassword">
					{{ t('common.ok') }}
				</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import {
	ElButton,
	ElDialog,
	ElForm,
	ElFormItem,
	ElInput,
	ElMessage,
	ElMessageBox,
	ElOption,
	ElSelect,
	ElTable,
	ElTableColumn
} from 'element-plus'
import { t } from '@ai-system/lib'
import {
	createUser,
	deleteUser,
	getUserList,
	updateUserPassword,
	updateUserRole,
	type UserDto
} from '@/api/user.api'
import { getSessionInfo, isAdminUser } from '@/utils/role'

const users = ref<UserDto[]>([])
const loading = ref(false)
const saving = ref(false)
const createDialogVisible = ref(false)
const passwordDialogVisible = ref(false)
const selectedUser = ref<UserDto | null>(null)

const createForm = ref({
	username: '',
	password: '',
	role: 2
})

const passwordForm = ref({
	password: ''
})

const roleOptions = computed(() => {
	const options = [{ value: 2, label: t('user.management.role.user') }]
	if (isAdmin.value) {
		options.unshift({ value: 1, label: t('user.management.role.admin') })
	}
	return options
})

const isAdmin = computed(() => isAdminUser())

const canEditRole = (user: UserDto) => {
	if (isAdmin.value) {
		return user.username !== 'admin'
	}
	const session = getSessionInfo()
	return session.role === 1 && user.role >= 2 && user.username !== 'admin'
}

const getRoleLabel = (role: number) => {
	return role === 1 ? t('user.management.role.admin') : t('user.management.role.user')
}

const canResetPassword = (user: UserDto) => {
	return canEditRole(user)
}

const isDeleteDisabled = (user: UserDto) => {
	return user.username === 'admin' || !canEditRole(user)
}

const loadUsers = async () => {
	loading.value = true
	try {
		const res = await getUserList()
		users.value = res.data?.data ?? []
	} catch (error) {
		ElMessage.error(t('user.management.load.failed'))
	} finally {
		loading.value = false
	}
}

const openCreateDialog = () => {
	createForm.value = {
		username: '',
		password: '',
		role: 2
	}
	createDialogVisible.value = true
	nextTick(() => {
		createForm.value.username = ''
		createForm.value.password = ''
	})
}

const handleCreate = async () => {
	if (!createForm.value.username || !createForm.value.password) {
		ElMessage.error(t('common.input.required'))
		return
	}
	saving.value = true
	try {
		await createUser({
			username: createForm.value.username,
			password: createForm.value.password,
			role: createForm.value.role
		})
		ElMessage.success(t('common.success'))
		createDialogVisible.value = false
		await loadUsers()
	} catch (error) {
		ElMessage.error(t('user.management.create.failed'))
	} finally {
		saving.value = false
	}
}

const confirmDelete = async (user: UserDto) => {
	try {
		await ElMessageBox.confirm(
			`${t('user.management.delete.confirm')} ${user.username}`,
			t('common.delete'),
			{
				confirmButtonText: t('common.ok'),
				cancelButtonText: t('common.cancel'),
				type: 'warning'
			}
		)
		await deleteUser(user.userId)
		ElMessage.success(t('common.success'))
		await loadUsers()
	} catch (error) {
		if (error !== 'cancel') {
			ElMessage.error(t('user.management.delete.failed'))
		}
	}
}

const saveRole = async (user: UserDto) => {
	try {
		await updateUserRole({ userId: user.userId, role: user.role })
		ElMessage.success(t('common.success'))
	} catch (error) {
		ElMessage.error(t('user.management.role.update.failed'))
		await loadUsers()
	}
}

const openResetPassword = (user: UserDto) => {
	selectedUser.value = user
	passwordForm.value.password = ''
	passwordDialogVisible.value = true
}

const handleResetPassword = async () => {
	if (!selectedUser.value) {
		return
	}
	if (!passwordForm.value.password) {
		ElMessage.error(t('common.input.required'))
		return
	}
	saving.value = true
	try {
		await updateUserPassword({
			userId: selectedUser.value.userId,
			newPassword: passwordForm.value.password
		})
		ElMessage.success(t('common.success'))
		passwordDialogVisible.value = false
	} catch (error) {
		ElMessage.error(t('user.management.password.update.failed'))
	} finally {
		saving.value = false
	}
}

onMounted(() => {
	loadUsers()
})
</script>

<style scoped lang="scss">
.user-management {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.user-management-header {
	display: flex;
	gap: 10px;
}

.role-label {
	color: var(--n-color-font-dark);
	font-weight: 500;
}
</style>
