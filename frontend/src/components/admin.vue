<template>
  <div class="admin-page">
    <navbar :role="'admin'" @nav="currentPage = $event" @logout="logout" />
    <!-- <p>欢迎 {{ userInfo.username }}管理员!</p> -->
    <room-manager v-if="currentPage === 'room'" />
    <user-manager v-if="currentPage === 'UserManager'" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import navbar from './NavBar.vue';
import RoomManager from './RoomManager.vue';
import UserManager from './UserManager.vue';

// 为了调试用户管理界面，暂时将该界面设置为默认界面
const currentPage = ref('UserManager');

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