<template>
  <div class="room-list-container">
    <div class="header-bar">
      <h2 class="title">机房列表</h2>
      <div class="search-wrapper">
        <input
          v-model="search"
          class="search-input"
          placeholder="搜索机房名称、位置、容量"
        />
        <span class="search-icon">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="7" stroke="#6d8cf0" stroke-width="2"/>
            <line x1="14.4142" y1="14.7071" x2="18" y2="18.2929" stroke="#6d8cf0" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
      </div>
    </div>
    <div v-if="loading" class="loading">正在加载机房数据...</div>
    <div v-else-if="error" class="error">⚠️ {{ error }}</div>
    <div v-else-if="filteredRooms.length === 0" class="empty">暂无机房信息</div>
    <div v-else class="room-table">
      <div class="table-header">
        <div
          v-for="col in columns"
          :key="col.key"
          class="header-item"
          :class="{ sortable: col.key !== 'action', active: sortKey === col.key }"
          @click="col.key !== 'action' && sortBy(col.key)"
        >
          {{ col.label }}
          <span class="sort-arrow" v-if="sortKey === col.key && col.key !== 'action'">
            <svg v-if="sortOrder === 'asc'" width="12" height="12" viewBox="0 0 12 12">
              <path d="M6 3l4 6H2z" fill="#6d8cf0"/>
            </svg>
            <svg v-else width="12" height="12" viewBox="0 0 12 12">
              <path d="M6 9l-4-6h8z" fill="#6d8cf0"/>
            </svg>
          </span>
        </div>
      </div>
      <div class="table-body">
        <div v-for="room in pagedRooms" :key="room.id" class="table-row">
          <div class="row-item">{{ room.name }}</div>
          <div class="row-item">{{ room.location || '-' }}</div>
          <div class="row-item">{{ room.capacity }} 人</div>
          <div class="row-item">
            <span class="status" :class="room.status">
              {{ statusText(room.status) }}
            </span>
          </div>
          <div class="row-item description">{{ room.description || '-' }}</div>
          <!-- 操作列：预约按钮 -->
          <div class="row-item">
            <button
              v-if="room.status === 'available'"
              class="reserve-btn"
              @click="openReserveDialog(room)"
            >预约</button>
          </div>
        </div>
      </div>
    </div>
    <Pagination
      v-if="filteredRooms.length > pageSize"
      :total="filteredRooms.length"
      :page-size="pageSize"
      v-model="page"
      style="margin-top: 24px;"
    />
    <!-- 预约弹窗 -->
    <transition name="dialog-fade">
      <div v-if="showReserveDialog" class="dialog-mask">
        <div class="dialog-box">
          <div class="dialog-icon-wrapper">
            <!-- ...icon... -->
          </div>
          <div class="dialog-title">
            预约机房：<span style="color:#6d8cf0">{{ reserveRoom?.name }}</span>
          </div>
          <div class="dialog-content" style="padding-bottom:0;">
            <form @submit.prevent="submitReservation" class="reserve-form">
              <div class="form-row">
                <label>日期</label>
                <input
                  type="date"
                  v-model="reserveForm.date"
                  :min="minDate"
                  :max="maxDate"
                  required
                />
              </div>
              <div class="form-row form-row-align-top">
                <label>时间段</label>
                <div class="time-slots-grid">
                  <button
                    v-for="slot in computedTimeSlots"
                    :key="slot.label"
                    type="button"
                    class="time-slot-btn"
                    :class="{
                      'disabled': slot.disabled,
                      'selected': selectedSlot && selectedSlot.label === slot.label
                    }"
                    :disabled="slot.disabled"
                    @click="selectTimeSlot(slot)"
                  >
                    {{ slot.label }}
                  </button>
                </div>
              </div>
              <div class="dialog-actions">
                <button type="submit" class="dialog-btn confirm" :disabled="reserveLoading || !selectedSlot">
                  <span v-if="reserveLoading" class="loading-spinner"></span>
                  确认预约
                </button>
                <button type="button" class="dialog-btn cancel" @click="closeReserveDialog">取消</button>
              </div>
              <div v-if="reserveError" class="error">{{ reserveError }}</div>
            </form>
          </div>
        </div>
      </div>
    </transition>
    <!-- 预约成功弹窗 -->
    <transition name="dialog-fade">
      <div v-if="showSuccessDialog" class="dialog-mask">
        <div class="dialog-box success-box">
          <div class="success-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="#eaf0ff"/>
              <path d="M15 25.5l7 7 11-13" stroke="#6d8cf0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="success-text">预约成功！</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import PinyinMatch from 'pinyin-match';
import Pagination from './Pagination.vue';

// ====== 基础数据 ======
const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
const pageSize = 10;
const today = new Date();
const minDateObj = new Date(today);
minDateObj.setDate(today.getDate() + 1);
const maxDateObj = new Date(today);
maxDateObj.setDate(today.getDate() + 7);
const minDate = minDateObj.toISOString().split('T')[0];
const maxDate = maxDateObj.toISOString().split('T')[0];

// ====== 响应式状态 ======
const rooms = ref([]);
const loading = ref(true);
const error = ref(null);
const search = ref('');
const sortKey = ref('status');
const sortOrder = ref('asc');
const page = ref(1);

const showReserveDialog = ref(false);
const reserveRoom = ref(null);
const reserveForm = ref({ date: '', start_time: '', end_time: '' });
const reserveLoading = ref(false);
const reserveError = ref('');
const showSuccessDialog = ref(false);
const bookedSlots = ref([]);
const loadingSlots = ref(false);
const selectedSlot = ref(null);

// ====== 表头定义 ======
const columns = [
  { key: 'name', label: '机房名称' },
  { key: 'location', label: '位置' },
  { key: 'capacity', label: '容量' },
  { key: 'status', label: '状态' },
  { key: 'description', label: '描述' },
  { key: 'action', label: '操作' }
];

// ====== 时间段定义 ======
const timeSlots = [
  { label: '08:00-10:00', start: '08:00', end: '10:00' },
  { label: '10:00-12:00', start: '10:00', end: '12:00' },
  { label: '14:00-16:00', start: '14:00', end: '16:00' },
  { label: '16:00-18:00', start: '16:00', end: '18:00' },
  { label: '18:00-20:00', start: '18:00', end: '20:00' },
  { label: '20:00-22:00', start: '20:00', end: '22:00' }
];

// ====== 机房数据获取 ======
const fetchRooms = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await fetch(`${apiBase}/api/rooms`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: '获取机房列表失败' }));
      throw new Error(err.message);
    }
    rooms.value = await res.json();
  } catch (e) {
    error.value = e.message;
    console.error(e);
  } finally {
    loading.value = false;
  }
};

// ====== 排序 ======
const sortBy = key => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

// ====== 状态文本 ======
const statusText = status => status === 'available' ? '可用' : '不可用';

// ====== 搜索与排序 ======
const filteredRooms = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  let filtered = rooms.value.filter(room => {
    if (!keyword) return true;
    return (
      (room.name && PinyinMatch.match(room.name, keyword)) ||
      (room.location && PinyinMatch.match(room.location, keyword)) ||
      (room.capacity && String(room.capacity).includes(keyword))
    );
  });

  return filtered.sort((a, b) => {
    let valA = a[sortKey.value] ?? '';
    let valB = b[sortKey.value] ?? '';
    if (sortKey.value === 'status') {
      const statusOrder = { available: 0, unavailable: 1 };
      return (sortOrder.value === 'asc' ? 1 : -1) * (statusOrder[valA] - statusOrder[valB]);
    }
    if (typeof valA === 'number' && typeof valB === 'number') {
      return (sortOrder.value === 'asc' ? 1 : -1) * (valA - valB);
    }
    return (sortOrder.value === 'asc' ? 1 : -1) * String(valA).localeCompare(String(valB), 'zh-CN');
  });
});

// ====== 分页 ======
const pagedRooms = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredRooms.value.slice(start, start + pageSize);
});

// ====== 预约弹窗相关 ======

// 选择时间段
const selectTimeSlot = slot => {
  if (!slot.disabled) selectedSlot.value = slot;
};

// 计算时间段禁用状态
const computedTimeSlots = computed(() =>
  timeSlots.map(slot => ({
    ...slot,
    disabled: bookedSlots.value.some(booked => booked.start_time.slice(0, 5) === slot.start)
  }))
);

// 获取已预约时间段
const fetchBookedSlots = async (roomId, date) => {
  if (!roomId || !date) return;
  loadingSlots.value = true;
  bookedSlots.value = [];
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${apiBase}/api/rooms/${roomId}/reservations?date=${date}`, {
      headers: { 'Authorization': token }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: '无法获取预约时段' }));
      throw new Error(err.message);
    }
    bookedSlots.value = await res.json();
  } catch (e) {
    reserveError.value = e.message;
  } finally {
    loadingSlots.value = false;
    // 自动选择第一个可用时间段
    selectedSlot.value = computedTimeSlots.value.find(s => !s.disabled) || null;
  }
};

// 监听日期变化，自动刷新时间段
watch(() => reserveForm.value.date, (newDate) => {
  if (showReserveDialog.value && reserveRoom.value) {
    fetchBookedSlots(reserveRoom.value.id, newDate);
  }
});

// 打开预约弹窗
const openReserveDialog = room => {
  reserveRoom.value = room;
  reserveForm.value.date = minDate;
  reserveError.value = '';
  selectedSlot.value = null;
  showReserveDialog.value = true;
  fetchBookedSlots(room.id, minDate);
};

// 关闭预约弹窗
const closeReserveDialog = () => {
  showReserveDialog.value = false;
  reserveRoom.value = null;
  bookedSlots.value = [];
};

// 提交预约
const submitReservation = async () => {
  reserveError.value = '';
  if (!reserveForm.value.date || !selectedSlot.value) {
    reserveError.value = '请选择一个可用的日期和时间段';
    return;
  }
  reserveLoading.value = true;
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${apiBase}/api/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        room_id: reserveRoom.value.id,
        date: reserveForm.value.date,
        start_time: selectedSlot.value.start,
        end_time: selectedSlot.value.end
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: '预约失败' }));
      throw new Error(err.message);
    }
    closeReserveDialog();
    showSuccessDialog.value = true;
    setTimeout(() => { showSuccessDialog.value = false; }, 1200);
    await fetchRooms();
  } catch (e) {
    reserveError.value = e.message;
  } finally {
    reserveLoading.value = false;
  }
};

// 页面加载时获取机房数据
onMounted(fetchRooms);
</script>