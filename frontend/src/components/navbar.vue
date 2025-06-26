<template>
  <nav class="navbar">
    <div class="navbar-title">机房预约系统</div>
    <ul class="navbar-menu">
      <!-- 菜单根据角色动态生成 -->
      <li v-for="item in menu" :key="item.label">
        <a href="#" 
           @click.prevent="$emit('nav', item.key)"
           :class="{ active: item.key === current }"
        >{{ item.label }}</a>
      </li>
    </ul>
    <div class="navbar-user">
      <span>当前身份：{{ role === 'admin' ? '管理员' : '教师' }}</span>
      <button class="logout-btn" @click="$emit('logout')">退出登录</button>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({
  role: { type: String, required: true },
  current: { type: String, default: '' }
});
const menu = computed(() => {
  return props.role === 'admin'
    ? [
        { label: '机房列表', key: 'room' },
        { label: '用户管理', key: 'user' }
      ]
    : [
        { label: '机房列表', key: 'room' },
        { label: '预约记录', key: 'reservation' }
      ];
});
</script>

<style scoped>
/* 顶部导航栏整体样式 */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  color: #6d8cf0;
  padding: 28px 48px;
  border-radius: 14px;
  margin-bottom: 2rem;
  box-shadow: 0 12px 32px rgba(109, 140, 240, 0.10);
  font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif;
  transition: box-shadow 0.3s;
}
.navbar:hover {
  box-shadow: 0 18px 40px rgba(109, 140, 240, 0.16);
}

/* 系统标题 */
.navbar-title {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #6d8cf0;
  user-select: none;
}

/* 菜单样式 */
.navbar-menu {
  list-style: none;
  display: flex;
  gap: 2.5rem;
  margin: 0;
  padding: 0;
}
.navbar-menu a {
  color: #6d8cf0;
  text-decoration: none;
  font-weight: bold;
  font-size: 20px;
  padding: 10px 22px;
  border-radius: 7px;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  position: relative;
  outline: none;
}
.navbar-menu a:hover,
.navbar-menu a:focus-visible {
  background: #f4f7f6;
  color: #5778d0;
  box-shadow: 0 2px 8px rgba(109, 140, 240, 0.08);
}
.navbar-menu a.active {
  background: linear-gradient(90deg, #6d8cf0 60%, #8fa7e9 100%);
  color: #fff;
  box-shadow: 0 4px 16px rgba(109, 140, 240, 0.13);
}

/* 用户信息与退出按钮 */
.navbar-user {
  font-size: 18px;
  color: #6d8cf0;
  opacity: 0.90;
  background: #f4f7f6;
  padding: 10px 24px;
  border-radius: 7px;
  font-weight: 500;
  box-shadow: 0 1px 4px rgba(109, 140, 240, 0.06);
  transition: background 0.2s;
  margin-left: 1.5rem;
  letter-spacing: 0.5px;
}
.logout-btn {
  margin-left: 18px;
  background: #fff;
  color: #6d8cf0;
  border: 1px solid #6d8cf0;
  border-radius: 5px;
  padding: 6px 16px;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.logout-btn:hover {
  background: #6d8cf0;
  color: #fff;
}

/* 响应式设计：适配不同屏幕宽度 */
@media (max-width: 900px) {
  .navbar {
    padding: 14px 4vw;
    border-radius: 10px;
    margin-bottom: 1rem;
  }
  .navbar-title {
    font-size: 22px;
  }
  .navbar-menu {
    gap: 1.2rem;
  }
  .navbar-menu a {
    font-size: 16px;
    padding: 7px 10px;
  }
  .navbar-user {
    font-size: 15px;
    padding: 7px 12px;
    border-radius: 5px;
    margin-left: 0.5rem;
  }
  .logout-btn {
    font-size: 14px;
    padding: 5px 10px;
    margin-left: 10px;
  }
}
@media (max-width: 600px) {
  .navbar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
    padding: 10px 2vw;
    border-radius: 8px;
    margin-bottom: 0.5rem;
  }
  .navbar-title {
    font-size: 17px;
    text-align: center;
    margin-bottom: 4px;
  }
  .navbar-menu {
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    width: 100%;
    margin-bottom: 4px;
  }
  .navbar-menu a {
    font-size: 15px;
    padding: 7px 0;
    border-radius: 5px;
    width: 100%;
    text-align: center;
  }
  .navbar-user {
    font-size: 14px;
    padding: 6px 6vw;
    border-radius: 5px;
    margin-left: 0;
    margin-top: 4px;
    text-align: center;
  }
}
</style>