<template>
  <div class="rooms-display">
    <h2>机房列表</h2>
    <div v-if="loading" class="loading-message">正在加载机房数据...</div>
    <div v-if="error" class="error-message">
      <p>加载数据失败，请稍后重试。</p>
      <p style="font-size:0.9em;color:#888;" v-if="error">{{ error }}</p>
      <p>请确保后端服务已启动并在 <code>{{ apiBase }}</code> 上运行。</p>
    </div>
    <ul v-if="!loading && !error && rooms.length" class="room-list">
      <li v-for="room in rooms" :key="room.id" class="room-item">
        <h3>{{ room.name }}</h3>
        <p><strong>位置:</strong> {{ room.location }}</p>
        <p><strong>容量:</strong> {{ room.capacity }} 人</p>
        <p v-if="room.description"><strong>描述:</strong> {{ room.description }}</p>
      </li>
    </ul>
    <div v-if="!loading && !error && !rooms.length" class="no-data-message">
      没有可显示的机房信息。
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import './RoomsDisplay.css'; // 新增：引入外部样式

const rooms = ref([]);
const loading = ref(true);
const error = ref(null);
const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

onMounted(async () => {
  try {
    const response = await fetch(`${apiBase}/api/rooms`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`HTTP error ${response.status}: ${errorData.message || response.statusText}`);
    }
    const data = await response.json();
    rooms.value = data;
  } catch (e) {
    console.error('Failed to fetch rooms:', e);
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});
</script>