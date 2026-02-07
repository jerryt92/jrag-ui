<template></template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { logout } from '@/api/login.api'
import { setUserRole } from '@/utils/role'

const router = useRouter()
onMounted(() => {
	logout().then(() => {
		setUserRole(null)
		router.push('/login')
	})
})
</script>
<style lang="scss" scoped></style>
