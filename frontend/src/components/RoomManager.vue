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

.room-management-container {
  background: #fff;
  padding: 2rem 2.5rem;
  border-radius: 14px;
  box-shadow: 0 12px 32px rgba(109,140,240,0.10);
  min-height: 500px;
}

.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.8rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.title {
  font-size: 26px;
  font-weight: 700;
  color: #333;
  margin: 0;
  letter-spacing: 1px;
}

.room-table {
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid #e8eef8;
  border-radius: 8px;
  overflow: hidden;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 1.2fr 1.5fr 0.8fr 1fr 2.5fr 1fr;
  align-items: center;
  padding: 18px 20px;
  gap: 1rem;
  font-size: 16px;
}

.table-header {
  background: #f8faff;
  font-weight: 600;
  color: #4a4a4a;
  font-size: 15px;
  border-bottom: 1px solid #e8eef8;
}

.table-row {
  color: #555;
  border-bottom: 1px solid #e8eef8;
  transition: background-color 0.2s;
  min-height: 66px;
}
.table-row:last-child {
  border-bottom: none;
}
.table-row:hover {
  background: #f4f7f6;
}
.row-item {
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 16px;
}
.row-item.description {
  white-space: normal;
}

/* 状态标签 */
.status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  display: inline-block;
}
.status.available {
  background: #e8f5e9;
  color: #388e3c;
}
.status.unavailable {
  background: #ffebee;
  color: #d32f2f;
}

/* 按钮样式 */
.button {
  padding: 6px 16px;
  font-size: 14px;
  border: none;
  border-radius: 20px;
  background: #6d8cf0;
  color: #fff;
  cursor: pointer;
  margin-right: 8px;
  transition: background 0.2s, color 0.2s;
}
.button:last-child {
  margin-right: 0;
}
.button:hover {
  background: #5778d0;
}
.button.danger {
  background: #f44336;
  color: #fff;
}
.button.danger:hover {
  background: #d32f2f;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  padding: 2.2rem 2.5rem 2rem 2.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 18px rgba(109, 140, 240, 0.18);
  min-width: 340px;
  max-width: 96vw;
}
.modal h3 {
  font-size: 22px;
  font-weight: 700;
  color: #6d8cf0;
  margin-bottom: 1.5rem;
  text-align: center;
}
.modal input, .modal select {
  width: 100%;
  padding: 10px 14px;
  margin-bottom: 1rem;
  border: 1px solid #e8eef8;
  border-radius: 8px;
  font-size: 15px;
  background: #f8faff;
  transition: border 0.2s;
}
.modal input:focus, .modal select:focus {
  border: 1.5px solid #6d8cf0;
  background: #fff;
}
.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}
.modal-buttons .button {
  flex: 1;
  margin: 0 4px;
}

/* 空状态和错误提示 */
.empty, .error, .loading {
  text-align: center;
  color: #888;
  font-size: 17px;
  margin: 2.5rem 0;
}
.error {
  color: #d32f2f;
}
.loading {
  color: #6d8cf0;
}

/* 响应式 */
@media (max-width: 900px) {
  .room-management-container { padding: 1.2rem 0.5rem; }
  .table-header, .table-row {
    font-size: 14px;
    padding: 10px 6px;
    gap: 0.5rem;
  }
  .modal { min-width: 220px; padding: 1.2rem 0.8rem; }
}
@media (max-width: 600px) {
  .table-header, .table-row {
    grid-template-columns: 1fr 1fr 1fr;
    font-size: 13px;
  }
  .modal { min-width: 120px; }
}
</style>