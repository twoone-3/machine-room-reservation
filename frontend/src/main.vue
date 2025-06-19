<script setup>
import { ref } from 'vue';
import login from './components/Login.vue';
import admin from './components/Admin.vue';
import teacher from './components/Teacher.vue';
import './main.css';

const role = ref(localStorage.getItem('role') || null);

function handleLoginSuccess(data) {
  role.value = data.role;
}
</script>

<template>
  <keep-alive>
    <component :is="role === 'admin' ? admin : role === 'teacher' ? teacher : login"
      @login-success="handleLoginSuccess" />
  </keep-alive>
</template>
