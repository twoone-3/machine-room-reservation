<template>
  <div class="teacher-page">
    <!-- 教师页面内容 -->
    <button @click="logout">退出登录</button>
    <p>欢迎 {{ userInfo.username }}教师!</p>
  </div>
  <navbar :role="'teacher'" />
</template>

<script setup>
import { ref } from 'vue';
import navbar from './navbar.vue';

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

<style src="./teacher.css"></style>