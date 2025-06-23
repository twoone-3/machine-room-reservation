<template>
  <!-- 仅在总页数大于1时显示分页 -->
  <div class="pagination" v-if="totalPages > 1">
    <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">‹</button>
    <button
      v-for="page in pages"
      :key="page"
      :class="{ active: page === currentPage }"
      @click="changePage(page)"
    >{{ page }}</button>
    <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">›</button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  total: { type: Number, required: true },      // 总条目数
  pageSize: { type: Number, default: 10 },      // 每页条数
  modelValue: { type: Number, default: 1 }      // 当前页码（v-model）
});
const emit = defineEmits(['update:modelValue']);

// 计算总页数
const totalPages = computed(() => Math.ceil(props.total / props.pageSize));
// 当前页
const currentPage = computed(() => props.modelValue);

// 生成页码数组
const pages = computed(() => {
  const arr = [];
  for (let i = 1; i <= totalPages.value; i++) arr.push(i);
  return arr;
});

// 切换页码
function changePage(page) {
  if (page < 1 || page > totalPages.value) return;
  emit('update:modelValue', page);
}
</script>

<style scoped>
.pagination {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 18px 0 0 0;
}
.pagination button {
  border: none;
  background: none;
  padding: 4px 12px;
  font-size: 16px;
  border-radius: 4px;
  color: #6d8cf0;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.pagination button.active,
.pagination button:hover:not(:disabled) {
  background: #e8eef8;
  color: #333;
}
.pagination button:disabled {
  color: #bbb;
  cursor: not-allowed;
  background: none;
}
</style>