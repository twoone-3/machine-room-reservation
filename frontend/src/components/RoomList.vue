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
          class="header-item sortable"
          :class="{ active: sortKey === col.key }"
          @click="sortBy(col.key)"
        >
          {{ col.label }}
          <span class="sort-arrow" v-if="sortKey === col.key">
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
        <div v-for="room in filteredRooms" :key="room.id" class="table-row">
          <div class="row-item">{{ room.name }}</div>
          <div class="row-item">{{ room.location || '-' }}</div>
          <div class="row-item">{{ room.capacity }} 人</div>
          <div class="row-item">
            <span class="status" :class="room.status">
              {{ statusText(room.status) }}
            </span>
          </div>
          <div class="row-item description">{{ room.description || '-' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import PinyinMatch from 'pinyin-match';

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
  { key: 'description', label: '描述' }
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

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

const statusText = (status) => status === 'available' ? '可用' : '不可用';

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

  filtered = [...filtered].sort((a, b) => {
    let valA = a[sortKey.value];
    let valB = b[sortKey.value];
    valA = valA ?? '';
    valB = valB ?? '';

    if (sortKey.value === 'status') {
      const statusOrder = { available: 0, unavailable: 1 };
      return sortOrder.value === 'asc'
        ? statusOrder[valA] - statusOrder[valB]
        : statusOrder[valB] - statusOrder[valA];
    }

    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder.value === 'asc' ? valA - valB : valB - valA;
    }
    return sortOrder.value === 'asc'
      ? String(valA).localeCompare(String(valB), 'zh-CN')
      : String(valB).localeCompare(String(valA), 'zh-CN');
  });
  return filtered;
});

onMounted(fetchRooms);
</script>

<style scoped>
.room-list-container {
  background-color: #fff;
  padding: 2rem 2.5rem;
  border-radius: 14px;
  box-shadow: 0 12px 32px rgba(109, 140, 240, 0.10);
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
  letter-spacing: 1px;
  margin: 0;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 320px;
  max-width: 100%;
}

.search-input {
  width: 100%;
  padding: 10px 18px 10px 36px; /* 调整左侧内边距 */
  border: none;
  border-radius: 24px;
  font-size: 16px;
  background: #f4f7fe;
  box-shadow: 0 2px 12px rgba(109, 140, 240, 0.10);
  transition: box-shadow 0.2s, background 0.2s;
  outline: none;
  color: #333;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 58%; /* 向下偏移一点 */
  transform: translateY(-50%);
  pointer-events: none;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.search-input:focus {
  background: #fff;
  box-shadow: 0 4px 18px rgba(109, 140, 240, 0.18);
  border: 1px solid #6d8cf0; /* 新增：聚焦时显示蓝色边框 */
}

.search-input:focus + .search-icon {
  opacity: 1;
}

@media (max-width: 600px) {
  .header-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.8rem;
  }
  .search-wrapper {
    width: 100%;
  }
}

.loading, .error, .empty {
  text-align: center;
  padding: 3rem 1rem;
  font-size: 17px;
  color: #666;
  background-color: #f4f7f6;
  border-radius: 8px;
}

.error {
  color: #d84315;
  background-color: #fbe9e7;
}

.room-table {
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid #e8eef8;
  border-radius: 8px;
  overflow: hidden;
}

.table-header, .table-row {
  display: grid;
  grid-template-columns: 1.2fr 1.5fr 0.8fr 1fr 2.5fr;
  align-items: center;
  padding: 14px 20px;
  gap: 1rem;
}

.table-header {
  background-color: #f8faff;
  font-weight: 600;
  color: #4a4a4a;
  font-size: 15px;
  border-bottom: 1px solid #e8eef8;
}

.table-header .sortable {
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;
}

.table-header .sortable.active {
  color: #6d8cf0;
}

.sort-arrow {
  display: inline-flex;
  vertical-align: middle;
  margin-left: 2px;
}

.table-row {
  font-size: 16px;
  color: #555;
  border-bottom: 1px solid #e8eef8;
  transition: background-color 0.2s;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background-color: #f4f7f6;
}

.header-item, .row-item {
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-item.description {
  white-space: normal;
}

.status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

.status.available {
  background-color: #e8f5e9;
  color: #388e3c;
}

.status.unavailable {
  background-color: #ffebee;
  color: #d32f2f;
}
</style>