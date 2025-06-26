<template>
  <div class="admin-page">
    <navbar :role="'admin'" @nav="currentPage = $event" @logout="logout" :current="currentPage" />
    <div class="admin-content">
      <room-manager v-if="currentPage === 'room'" />
      <user-manager v-if="currentPage === 'user'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import navbar from './NavBar.vue';
import RoomManager from './RoomManager.vue';
import UserManager from './UserManager.vue';

const currentPage = ref('user');

const logout = () => {
  localStorage.removeItem('role');
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  location.reload();
};
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: #f4f7f6;
  padding: 0;
}
.admin-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 0 2rem 0;
}
</style>