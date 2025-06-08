<script setup>
// import HelloWorld from './components/HelloWorld.vue' // 可以移除或注释掉旧组件
import RoomsDisplay from './components/RoomsDisplay.vue' // 引入新的机房显示组件
</script>

<template>
  <header class="app-header">
    <div class="logo-container">
      <a href="https://vite.dev" target="_blank">
        <img src="/vite.svg" class="logo vite" alt="Vite logo" />
      </a>
      <a href="https://vuejs.org/" target="_blank">
        <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
      </a>
    </div>
    <h1>机房预约系统</h1>
  </header>
  <main>
    <!-- <HelloWorld msg="Vite + Vue" /> -->  <!-- 可以移除或注释掉旧组件 -->
    <RoomsDisplay /> <!-- 使用新的机房显示组件 -->
  </main>
</template>

<style scoped>
.app-header {
  text-align: center;
  padding: 1rem 0;
  border-bottom: 1px solid #eaeaea;
  margin-bottom: 2rem;
}

@media (prefers-color-scheme: dark) {
  .app-header {
    border-bottom: 1px solid #3a3a3a;
  }
  .app-header h1 {
    color: rgba(255, 255, 255, 0.87);
  }
}


.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2em;
  margin-bottom: 1rem;
}

.logo {
  height: 4em; /* 调整 Logo 大小 */
  padding: 0.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo.vite:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

/* 确保 #app 样式不会干扰新组件的布局 */
/* style.css 中的 #app 样式:
#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}
可以保留，但 RoomsDisplay 组件内部有自己的 padding 和 max-width
*/
</style>
