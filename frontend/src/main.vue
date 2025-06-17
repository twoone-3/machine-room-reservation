<script setup>
import { ref } from 'vue';
import login from './components/login.vue';
import admin from './components/admin.vue';
import teacher from './components/teacher.vue';
import './main.css';

const role = ref(localStorage.getItem('role') || null);

function handleLoginSuccess(data) {
  role.value = data.role;
}
</script>

<template>
  <component :is="role === 'admin' ? admin : role === 'teacher' ? teacher : login"
    @login-success="handleLoginSuccess" />
</template>
