<script setup>
import './login.css';
import { ref, onMounted } from 'vue';

const emit = defineEmits(['login-success']);

const username = ref('');
const password = ref('');
const showPassword = ref(false);
const remember = ref(false);
const loading = ref(false);
const error = ref(null);
const successMessage = ref(null);
const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
const userInfo = ref(null);

// 页面加载时自动填充已记住的用户名和密码
onMounted(() => {
  const saved = localStorage.getItem('rememberPassword');
  if (saved) {
    try {
      const { username: u, password: p } = JSON.parse(saved);
      username.value = u || '';
      password.value = p || '';
      remember.value = true;
    } catch {
      // 忽略解析错误
    }
  }
});

// 登录逻辑
const login = async () => {
  error.value = null;
  successMessage.value = null;

  // 表单校验
  if (!username.value.trim()) {
    error.value = '用户名字段不能为空';
    return;
  }
  if (!password.value) {
    error.value = '密码字段不能为空';
    return;
  }

  // 记住密码逻辑
  if (remember.value) {
    localStorage.setItem('rememberPassword', JSON.stringify({
      username: username.value,
      password: password.value
    }));
  } else {
    localStorage.removeItem('rememberPassword');
  }

  loading.value = true;
  try {
    // 发起登录请求
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
    // 登录成功，保存用户信息
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('username', data.username);
    userInfo.value = data;
    successMessage.value = '登录成功！';
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
        <div class="form-group password-group">
          <label for="password">密码</label>
          <div class="password-wrapper">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="current-password"
              placeholder="请输入密码"
            />
            <span class="eye-icon" @click="showPassword = !showPassword" :title="showPassword ? '隐藏密码' : '显示密码'">
              <!-- 密码可见/隐藏切换 -->
              <svg v-if="showPassword" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6d8cf0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <ellipse cx="12" cy="12" rx="7" ry="5"></ellipse>
                <circle cx="12" cy="12" r="2"></circle>
              </svg>
              <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6d8cf0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <ellipse cx="12" cy="12" rx="7" ry="5"></ellipse>
                <line x1="3" y1="3" x2="21" y2="21"></line>
              </svg>
            </span>
          </div>
        </div>
        <div class="form-group remember-group">
          <label class="custom-checkbox">
            <input id="remember" type="checkbox" v-model="remember" />
            <span class="checkmark"></span>
            记住密码
          </label>
        </div>
        <button type="submit" :disabled="loading">{{ loading ? '登录中...' : '登录' }}</button>
        <div v-if="error" class="error-message">
          <span>⚠️ {{ error }}</span>
        </div>
        <div v-if="successMessage" class="success-message">
          <span>✅ {{ successMessage }}</span>
        </div>
      </form>
    </div>
  </div>
</template>
