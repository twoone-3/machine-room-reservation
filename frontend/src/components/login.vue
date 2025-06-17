<script setup>
import './login.css';
import { ref } from 'vue';

// 新增：获取 emit
const emit = defineEmits(['login-success']);

const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref(null);
const successMessage = ref(null);
const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const userInfo = ref(null);

const login = async () => {
  error.value = null;
  successMessage.value = null;

  if (!username.value.trim()) {
    error.value = '用户名字段不能为空';
    return;
  }
  if (!password.value) {
    error.value = '密码字段不能为空';
    return;
  }

  loading.value = true;
  try {
    const response = await fetch(`${apiBase}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || '登录失败');
    }
    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('username', data.username);
    userInfo.value = data;
    successMessage.value = '登录成功！';
    // 正确使用 emit
    emit('login-success', data);
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-bg">
    <div class="login-container">
      <div class="login-header">
        <h2>机房预约系统</h2>
      </div>
      <form @submit.prevent="login" class="login-form" novalidate>
        <div class="form-group">
          <label for="username">用户名</label>
          <input id="username" v-model="username" type="text" required autocomplete="username" placeholder="请输入用户名" />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input id="password" v-model="password" type="password" required autocomplete="current-password"
            placeholder="请输入密码" />
        </div>
        <button type="submit" :disabled="loading">{{ loading ? '登录中...' : '登录' }}</button>
        <div v-if="error" class="error-message">
          <span>⚠️ {{ error }}</span>
        </div>
        <div v-if="successMessage" class="success-message"> <!-- 新增：显示成功消息 -->
          <span>✅ {{ successMessage }}</span>
        </div>
      </form>
    </div>
  </div>
</template>
