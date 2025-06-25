<template>
  <div class="admin-page">
    <navbar :role="'admin'" @nav="currentPage = $event" @logout="logout" />
    <!-- <p>欢迎 {{ userInfo.username }}管理员!</p> -->
    <room-manager v-if="currentPage === 'room'" />
    <user-manager v-if="currentPage === 'user'" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import navbar from './NavBar.vue';
import RoomManager from './RoomManager.vue';
import UserManager from './UserManager.vue';

// 默认显示用户管理界面
const currentPage = ref('user');

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