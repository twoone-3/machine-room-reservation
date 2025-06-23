<template>
  <div class="reservation-list-container">
    <div class="header-bar">
      <h2 class="title">我的预约记录</h2>
      <div class="search-wrapper">
        <input
          v-model="search"
          class="search-input"
          placeholder="搜索机房名称、位置、日期"
        />
        <span class="search-icon">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="7" stroke="#6d8cf0" stroke-width="2"/>
            <line x1="14.4142" y1="14.7071" x2="18" y2="18.2929" stroke="#6d8cf0" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
      </div>
    </div>
    <div v-if="loading" class="loading">正在加载预约数据...</div>
    <div v-else-if="error" class="error">⚠️ {{ error }}</div>
    <div v-else-if="filteredReservations.length === 0" class="empty">您还没有任何预约记录</div>
    <div v-else class="reservation-table">
      <div class="table-header">
        <div class="header-item">机房名称</div>
        <div class="header-item">位置</div>
        <div class="header-item">预约日期</div>
        <div class="header-item">时间段</div>
        <div class="header-item">状态</div>
        <div class="header-item">操作</div>
      </div>
      <div class="table-body">
        <div v-for="res in pagedReservations" :key="res.id" class="table-row">
          <div class="row-item">{{ res.Room.name }}</div>
          <div class="row-item">{{ res.Room.location }}</div>
          <div class="row-item">{{ res.date }}</div>
          <div class="row-item">{{ res.start_time.slice(0,5) }} - {{ res.end_time.slice(0,5) }}</div>
          <div class="row-item">
            <span class="status" :class="res.status">{{ statusText(res.status) }}</span>
          </div>
          <div class="row-item">
            <button
              v-if="res.status === 'booked'"
              class="cancel-btn"
              :disabled="cancelingId === res.id"
              @click="openCancelDialog(res.id)"
            >
              {{ cancelingId === res.id ? '取消中...' : '取消预约' }}
            </button>
          </div>
        </div>
      </div>
      <Pagination
        v-if="filteredReservations.length > pageSize"
        :total="filteredReservations.length"
        :page-size="pageSize"
        v-model="page"
        style="margin-top: 24px;"
      />
    </div>

    <!-- 取消确认弹窗 -->
    <transition name="dialog-fade">
      <div v-if="showDialog" class="dialog-mask">
        <div class="dialog-box">
          <div class="dialog-icon-wrapper">
            <svg class="dialog-icon warning" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e42" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div class="dialog-title">确认取消预约</div>
          <div class="dialog-content">此操作不可撤销，您确定要取消该预约吗？</div>
          <div class="dialog-actions">
            <button class="dialog-btn confirm" @click="cancelReservation" :disabled="cancelingId === dialogReservationId">
              {{ cancelingId === dialogReservationId ? '取消中...' : '确认取消' }}
            </button>
            <button class="dialog-btn cancel" @click="closeDialog">再想想</button>
          </div>
        </div>
      </div>
    </transition>
    <!-- 取消成功弹窗 -->
    <transition name="dialog-fade">
      <div v-if="showSuccessDialog" class="dialog-mask">
        <div class="dialog-box success-box">
          <div class="success-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="#eaf0ff"/>
              <path d="M15 25.5l7 7 11-13" stroke="#6d8cf0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="success-text">取消成功！</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import Pagination from './Pagination.vue';

// ====== 响应式状态 ======
const reservations = ref([]);
const loading = ref(true);
const error = ref(null);
const page = ref(1);
const pageSize = 10;
const cancelingId = ref(null);
const search = ref('');
const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const showDialog = ref(false);
const dialogReservationId = ref(null);
const showSuccessDialog = ref(false);

// 预约状态文本映射
const statusText = status => ({
  booked: '已预约',
  completed: '已完成',
  cancelled: '已取消'
}[status] || '未知');

// 获取当前用户预约记录
const fetchReservations = async () => {
  loading.value = true;
  error.value = null;
  const token = localStorage.getItem('token');
  if (!token) {
    error.value = '用户未登录，无法获取预约记录';
    loading.value = false;
    return;
  }
  try {
    const response = await fetch(`${apiBase}/api/reservations/my`, {
      headers: { 'Authorization': token }
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '获取预约记录失败' }));
      throw new Error(errorData.message);
    }
    reservations.value = await response.json();
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
};

// 搜索与排序
const filteredReservations = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  const statusOrder = { booked: 0, completed: 1, cancelled: 2 };
  return reservations.value
    .filter(res =>
      !keyword ||
      (res.Room.name && res.Room.name.toLowerCase().includes(keyword)) ||
      (res.Room.location && res.Room.location.toLowerCase().includes(keyword)) ||
      (res.date && res.date.includes(keyword))
    )
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
});

// 分页
const pagedReservations = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredReservations.value.slice(start, start + pageSize);
});

// 打开取消预约确认弹窗
const openCancelDialog = id => {
  dialogReservationId.value = id;
  showDialog.value = true;
};
// 关闭弹窗
const closeDialog = () => {
  showDialog.value = false;
  dialogReservationId.value = null;
};

// 取消预约
const cancelReservation = async () => {
  const id = dialogReservationId.value;
  if (!id) return;
  cancelingId.value = id;
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${apiBase}/api/reservations/${id}/cancel`, {
      method: 'POST',
      headers: { 'Authorization': token }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: '取消失败' }));
      throw new Error(err.message);
    }
    await fetchReservations();
    closeDialog();
    showSuccessDialog.value = true;
    setTimeout(() => { showSuccessDialog.value = false; }, 1200);
  } catch (e) {
    alert(e.message);
  } finally {
    cancelingId.value = null;
  }
};

// 页面加载时获取预约数据
onMounted(fetchReservations);
</script>

<style src ="./teacher.css"></style>