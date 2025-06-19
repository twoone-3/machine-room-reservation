<template>
  <nav class="navbar">
    <div class="navbar-title">机房预约系统</div>
    <ul class="navbar-menu">
      <li v-for="item in menu" :key="item.label">
        <a :href="item.link">{{ item.label }}</a>
      </li>
    </ul>
    <div class="navbar-user">
      <span>当前身份：{{ role === 'admin' ? '管理员' : '教师' }}</span>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  role: {
    type: String,
    required: true
  }
});

const menu = computed(() => {
  if (props.role === 'admin') {
    return [
      { label: '机房列表', link: '#' },
      { label: '用户列表', link: '#' }
    ];
  } else {
    return [
      { label: '机房列表', link: '#' },
      { label: '预约记录', link: '#' }
    ];
  }
});
</script>

<style src="./navbar.css"></style>