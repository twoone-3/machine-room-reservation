<template>
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
  total: { type: Number, required: true },
  pageSize: { type: Number, default: 10 },
  modelValue: { type: Number, default: 1 }
});
const emit = defineEmits(['update:modelValue']);

const totalPages = computed(() => Math.ceil(props.total / props.pageSize));
const currentPage = computed(() => props.modelValue);

const pages = computed(() => {
  const arr = [];
  for (let i = 1; i <= totalPages.value; i++) arr.push(i);
  return arr;
});

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