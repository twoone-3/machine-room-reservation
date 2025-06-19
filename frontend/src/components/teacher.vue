<template>
  <div class="teacher-page">
    <navbar :role="'teacher'" @nav="currentPage = $event" @logout="logout" />
    <room-list v-if="currentPage === 'room'" />
    <reservation-list v-else-if="currentPage === 'reservation'" />
    <back-to-top />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import navbar from './NavBar.vue';
import RoomList from './RoomList.vue';
import ReservationList from './ReservationList.vue';
import BackToTop from './BackToTop.vue';

const userInfo = ref({
  username: localStorage.getItem('username') || ''
});

const currentPage = ref('room'); // 默认显示机房列表

const logout = () => {
  localStorage.removeItem('role');
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  location.reload();
};
</script>

<style src="./teacher.css"></style>