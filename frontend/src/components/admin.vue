<template>
  <div class="admin-page">
    <navbar :role="'admin'" @nav="currentPage = $event" @logout="logout"  />
    <room-manager v-if="currentPage === 'room'" />
    <user-manager v-if="currentPage === 'user'" />
    <back-to-top />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import navbar from './NavBar.vue';
import RoomManager from './RoomManager.vue';
import UserManager from './UserManager.vue';
import BackToTop from './BackToTop.vue';

const currentPage = ref('user');

const logout = () => {
  localStorage.removeItem('role');
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  location.reload();
};
</script>

<style src="./admin.css"></style>