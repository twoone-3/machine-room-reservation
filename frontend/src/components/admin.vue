<template>
  <div class="admin-page">
    <navbar :role="'admin'" @logout="logout" />
    <p>欢迎 {{ userInfo.username }}管理员!</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import navbar from './NavBar.vue';

const userInfo = ref({
  username: localStorage.getItem('username') || ''
});

const logout = () => {
  localStorage.removeItem('role');
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  location.reload();
};
</script>

<style src="./admin.css"></style>