<template>
  <div class="admin-page">
    <!-- 管理员页面内容 -->
    <button @click="logout">退出登录</button>
    <p>欢迎 {{ userInfo.username }}管理员!</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

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