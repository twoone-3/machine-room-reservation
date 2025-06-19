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
            <svg class="dialog-icon" width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" fill="#eaf0ff"/>
              <path d="M12 7v5l3 3" stroke="#6d8cf0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="dialog-title">
            预约机房：<span style="color:#6d8cf0">{{ reserveRoom?.name }}</span>
          </div>
          <div class="dialog-content" style="padding-bottom:0;">
            <form @submit.prevent="submitReservation" class="reserve-form">
              <div class="form-row">
                <label>日期</label>
                <input type="date" v-model="reserveForm.date" :min="today" required />
              </div>
              <div class="form-row">
                <label>开始时间</label>
                <div class="custom-time-input">
                  <select v-model="timeParts.startHour" required>
                    <option v-for="h in 24" :key="`start-h-${h}`" :value="(h-1).toString().padStart(2, '0')">
                      {{ (h-1).toString().padStart(2, '0') }}
                    </option>
                  </select>
                  <span>:</span>
                  <select v-model="timeParts.startMinute" required>
                    <option v-for="m in 6" :key="`start-m-${m}`" :value="((m-1)*10).toString().padStart(2, '0')">
                      {{ ((m-1)*10).toString().padStart(2, '0') }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <label>结束时间</label>
                <div class="custom-time-input">
                  <select v-model="timeParts.endHour" required>
                    <option v-for="h in 24" :key="`end-h-${h}`" :value="(h-1).toString().padStart(2, '0')">
                      {{ (h-1).toString().padStart(2, '0') }}
                    </option>
                  </select>
                  <span>:</span>
                  <select v-model="timeParts.endMinute" required>
                    <option v-for="m in 6" :key="`end-m-${m}`" :value="((m-1)*10).toString().padStart(2, '0')">
                      {{ ((m-1)*10).toString().padStart(2, '0') }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="dialog-actions">
                <button type="submit" class="dialog-btn confirm" :disabled="reserveLoading">
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
import { ref, onMounted, computed, watchEffect } from 'vue';
import PinyinMatch from 'pinyin-match';
import Pagination from './Pagination.vue';

const today = new Date().toISOString().split('T')[0];

const rooms = ref([]);
const loading = ref(true);
const error = ref(null);
const search = ref('');
const sortKey = ref('status');
const sortOrder = ref('asc');
const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const columns = [
  { key: 'name', label: '机房名称' },
  { key: 'location', label: '位置' },
  { key: 'capacity', label: '容量' },
  { key: 'status', label: '状态' },
  { key: 'description', label: '描述' },
  { key: 'action', label: '操作' }
];

const fetchRooms = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch(`${apiBase}/api/rooms`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '获取机房列表失败' }));
      throw new Error(errorData.message);
    }
    rooms.value = await response.json();
  } catch (e) {
    error.value = e.message;
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const sortBy = key => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

const statusText = status => status === 'available' ? '可用' : '不可用';

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

const page = ref(1);
const pageSize = 10;
const pagedRooms = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredRooms.value.slice(start, start + pageSize);
});

onMounted(fetchRooms);

const showReserveDialog = ref(false);
const reserveRoom = ref(null);
const reserveForm = ref({ date: '', start_time: '', end_time: '' });
const reserveLoading = ref(false);
const reserveError = ref('');
const showSuccessDialog = ref(false);
const timeParts = ref({
  startHour: '09',
  startMinute: '00',
  endHour: '10',
  endMinute: '00'
});

// 监听时间选择的变化，并自动更新表单数据
watchEffect(() => {
  reserveForm.value.start_time = `${timeParts.value.startHour}:${timeParts.value.startMinute}`;
  reserveForm.value.end_time = `${timeParts.value.endHour}:${timeParts.value.endMinute}`;
});

const openReserveDialog = room => {
  reserveRoom.value = room;
  // 设置表单默认值
  reserveForm.value.date = today;
  timeParts.value = {
    startHour: '09',
    startMinute: '00',
    endHour: '10',
    endMinute: '00'
  };
  reserveError.value = '';
  showReserveDialog.value = true;
};
const closeReserveDialog = () => {
  showReserveDialog.value = false;
  reserveRoom.value = null;
};

const submitReservation = async () => {
  reserveError.value = '';
  // 校验结束时间不能小于等于开始时间
  const start = `${timeParts.value.startHour}:${timeParts.value.startMinute}`;
  const end = `${timeParts.value.endHour}:${timeParts.value.endMinute}`;
  if (end <= start) {
    reserveError.value = '结束时间必须大于开始时间';
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
        start_time: reserveForm.value.start_time,
        end_time: reserveForm.value.end_time
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: '预约失败' }));
      throw new Error(err.message);
    }
    closeReserveDialog();
    showSuccessDialog.value = true;
    setTimeout(() => { showSuccessDialog.value = false; }, 1800);
    await fetchRooms();
  } catch (e) {
    reserveError.value = e.message;
  } finally {
    reserveLoading.value = false;
  }
};
</script>

