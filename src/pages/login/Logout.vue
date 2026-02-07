<template></template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { logout } from '@/api/login.api'
import { setSessionInfo } from '@/utils/role'

const router = useRouter()
onMounted(() => {
	logout().then(() => {
		setSessionInfo(null)
		router.push('/login')
	})
})
</script>
<style lang="scss" scoped></style>
