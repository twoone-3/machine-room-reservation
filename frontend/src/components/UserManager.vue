<!-- 管理员用户管理界面 -->
<!-- 页面展示用户列表中的所有用户对象与部分相关信息(是否正在使用机房),管理员可将某个用户设置为管理员、删除用户或添加新用户 -->
<!-- 
    目前功能：
        1.查看所有用户（显示用户列表）
        2.添加新用户（弹窗或内嵌表单）
        3.设置某用户为管理员
        4.删除用户

    待办功能：
        1.联调后端获取用户信息
        2.联调后端向数据库添加用户
        3.联调后端删除数据库中用户数据
        4.页面的切换和定位
        5.希望可以在用户表上加一个“密码”属性

    预期接收：
        user: [{
            "id": Long,
            "username": String,
            "role": String // 若不为'admin' or 'teacher', 会在角色列显示错误
        },...]

    预期提交: 
    newUser: {
        "username": String,
        "contact": String,
        "role": String, // 未设置限制，也就是用户可以输任何值，需要在前端或后端添加逻辑判断合法性
        "password": String // 管理员可以设置用户的初始密码。也可以修改逻辑，为每一个新增用户设置统一的初始密码
    }

    注意: 其中if(test.value)均为无后端进行的测试，接上后端后可删除。其中ajax逻辑可以修改为更优的。
 -->
<template>
  <div class="user-management-container">
    <!-- 顶部栏 -->
    <div class="header-bar">
      <h2 class="title">用户管理</h2>
      <button class="button" @click="showAddUser = true">添加用户</button>
    </div>

    <div v-if="loading" class="loading">正在加载用户数据...</div>
    <div v-else-if="error" class="error">⚠️ {{ error }}</div>
    <div v-else-if="userList.length === 0" class="empty">暂无用户信息</div>
    <!-- 用户表格 -->
    <div v-else class="user-table">
      <div class="table-header">
        <div>用户名</div>
        <div>角色</div>
        <div>操作</div>
      </div>
      <div class="table-row" v-for="user in userList" :key="user.id">
        <div class="row-item">{{ user.username }}</div>
        <div class="row-item">{{ user.role === 'admin' ? '管理员' : user.role === 'teacher' ? '教师' : '错误' }}</div>
        <div class="row-item">
          <button class="button" v-if="user.role !== 'admin'" @click="setAsAdmin(user.id)">设为管理员</button>
          <button class="button danger" @click="deleteUser(user.id)">删除</button>
        </div>
      </div>
    </div>

    <!-- 添加用户弹窗 -->
    <div v-if="showAddUser" class="modal-overlay">
      <div class="modal">
        <h3>添加新用户</h3>
        <form @submit.prevent="submitAddUser">
          <input v-model="form.username" placeholder="用户名" required />
          <input v-model="form.role" placeholder="身份(admin/teacher)" required />
          <input v-model="form.password" type="password" placeholder="密码" required />
          <div class="modal-buttons">
            <button type="submit" class="button">添加</button>
            <button type="button" class="button danger" @click="showAddUser = false">取消</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
const loading = ref(true);
const error = ref(null);

// 表单数据
const form = ref({ username: '', contact: '', role: '', password: '' });
const showAddUser = ref(false);
const userList = ref([]);

// 获取用户列表接口
const fetchUsers = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch(`${apiBase}/api/users`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '获取用户列表失败' }));
      throw new Error(errorData.message);
    }
    userList.value = await response.json();
  } catch (e) {
    error.value = e.message;
    console.error(e);
  } finally {
    loading.value = false;
  }
}

// 修改用户身份为管理员
const setAsAdmin = async (id) => {
  try {
    const response = await fetch(`${apiBase}/api/users/${id}/promote`, { method: 'POST' });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '设置管理员失败' }));
      throw new Error(errorData.message);
    }
    fetchUsers();
  } catch (e) {
    alert(e.message);
  }
}

// 删除用户
const deleteUser = async (id) => {
  if (!confirm('确定要删除该用户吗？')) return;
  try {
    const response = await fetch(`${apiBase}/api/users/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '删除用户失败' }));
      throw new Error(errorData.message);
    }
    fetchUsers();
  } catch (e) {
    alert(e.message);
  }
}

// 申请添加用户
const submitAddUser = async () => {
  try {
    const response = await fetch(`${apiBase}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '添加用户失败' }));
      throw new Error(errorData.message);
    }
    showAddUser.value = false;
    form.value = { username: '', contact: '', role: '', password: '' };
    fetchUsers();
  } catch (e) {
    alert(e.message);
  }
}

onMounted(fetchUsers)
</script>

<style scoped>
.user-management-container {
  background-color: #fff;
  padding: 2rem 2.5rem;
  border-radius: 14px;
  box-shadow: 0 12px 32px rgba(109, 140, 240, 0.10);
}

/* 顶部按钮栏与搜索 */
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
  margin: 0;
}

/* 表格样式 */
.user-table {
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid #e8eef8;
  border-radius: 8px;
  overflow: hidden;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 1.2fr 1.5fr 1fr 2fr;
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

.row-item {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.button {
  padding: 6px 12px;
  font-size: 14px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  background-color: #6d8cf0;
  color: #fff;
  transition: background-color 0.2s;
}

.button:hover {
  background-color: #5a78e0;
}

.button.danger {
  background-color: #e74c3c;
}

.button.danger:hover {
  background-color: #c0392b;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 2rem;
  width: 350px;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(109, 140, 240, 0.15);
}

.modal h3 {
  margin-bottom: 1rem;
  font-size: 20px;
  color: #333;
}

.modal input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 24px;
  border: 1px solid #ddd;
  font-size: 16px;
  margin-bottom: 1rem;
  background: #f4f7fe;
  outline: none;
  transition: box-shadow 0.2s, background 0.2s;
}

.modal input:focus {
  background: #fff;
  box-shadow: 0 4px 18px rgba(109, 140, 240, 0.18);
  border: 1px solid #6d8cf0;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.modal-buttons .button {
  flex: 1;
  margin: 0 4px;
}

/* 响应式 */
@media (max-width: 600px) {
  .header-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.8rem;
  }

  .user-table .table-header,
  .user-table .table-row {
    grid-template-columns: 1fr 1fr;
    font-size: 14px;
  }
}
</style>
