<template>
  <div class="room-management-container">
    <div class="header-bar">
      <h2 class="title">机房管理</h2>
      <button class="button" @click="showAdd = true">添加机房</button>
    </div>
    <div v-if="loading" class="loading">正在加载机房数据...</div>
    <div v-else-if="error" class="error">⚠️ {{ error }}</div>
    <div v-else-if="roomList.length === 0" class="empty">暂无机房信息</div>
    <div v-else class="room-table">
      <div class="table-header">
        <div>名称</div>
        <div>位置</div>
        <div>容量</div>
        <div>状态</div>
        <div>描述</div>
        <div>操作</div>
      </div>
      <div class="table-row" v-for="room in roomList" :key="room.id">
        <div class="row-item">{{ room.name }}</div>
        <div class="row-item">{{ room.location }}</div>
        <div class="row-item">{{ room.capacity }}</div>
        <div class="row-item">
          <span class="status" :class="room.status">
            {{ room.status === 'available' ? '可用' : '不可用' }}
          </span>
        </div>
        <div class="row-item">{{ room.description }}</div>
        <div class="row-item">
          <button class="button" @click="editRoom(room)">编辑</button>
          <button class="button danger" @click="deleteRoom(room.id)">删除</button>
        </div>
      </div>
    </div>

    <!-- 添加/编辑机房弹窗 -->
    <div v-if="showAdd || showEdit" class="modal-overlay">
      <div class="modal">
        <h3>{{ showAdd ? '添加机房' : '编辑机房' }}</h3>
        <form @submit.prevent="submitRoom">
          <input v-model="form.name" placeholder="机房名称" required />
          <input v-model="form.location" placeholder="位置" required />
          <input v-model.number="form.capacity" type="number" min="1" placeholder="容量" required />
          <select v-model="form.status" required>
            <option value="available">可用</option>
            <option value="unavailable">不可用</option>
          </select>
          <input v-model="form.description" placeholder="描述" />
          <div class="modal-buttons">
            <button type="submit" class="button">{{ showAdd ? '添加' : '保存' }}</button>
            <button type="button" class="button danger" @click="closeModal">取消</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
const loading = ref(true);
const error = ref(null);

const roomList = ref([]);
const showAdd = ref(false);
const showEdit = ref(false);
const form = ref({
  id: null,
  name: '',
  location: '',
  capacity: 1,
  status: 'available',
  description: ''
});

// 获取机房列表
const fetchRooms = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await fetch(`${apiBase}/api/rooms`);
    if (!res.ok) throw new Error('获取机房列表失败');
    roomList.value = await res.json();
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
};

// 添加/编辑机房
const submitRoom = async () => {
  try {
    const method = showAdd.value ? 'POST' : 'PUT';
    const url = showAdd.value
      ? `${apiBase}/api/rooms`
      : `${apiBase}/api/rooms/${form.value.id}`;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });
    if (!res.ok) throw new Error('操作失败');
    closeModal();
    fetchRooms();
  } catch (e) {
    alert(e.message);
  }
};

// 删除机房
const deleteRoom = async (id) => {
  if (!confirm('确定要删除该机房吗？')) return;
  try {
    const res = await fetch(`${apiBase}/api/rooms/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('删除失败');
    fetchRooms();
  } catch (e) {
    alert(e.message);
  }
};

// 编辑机房
const editRoom = (room) => {
  form.value = { ...room };
  showEdit.value = true;
  showAdd.value = false;
};

const closeModal = () => {
  showAdd.value = false;
  showEdit.value = false;
  form.value = { id: null, name: '', location: '', capacity: 1, status: 'available', description: '' };
};

onMounted(fetchRooms);
</script>

<style scoped>
@import './teacher.css';
.room-management-container { background: #fff; padding: 2rem 2.5rem; border-radius: 14px; box-shadow: 0 12px 32px rgba(109,140,240,0.10);}
</style>