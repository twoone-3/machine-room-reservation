<template>
  <transition name="fade-in-up">
    <button
      ref="buttonRef"
      v-show="visible"
      class="back-to-top"
      @click="scrollToTop"
      aria-label="返回顶部"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const visible = ref(false);
const buttonRef = ref(null); // 1. 创建一个 ref 来引用按钮元素
const scrollThreshold = 150; // 显示按钮的滚动阈值

// 滚动事件处理函数
const handleScroll = () => {
  // 使用 requestAnimationFrame 来优化性能，确保只在浏览器下一次重绘前更新状态
  window.requestAnimationFrame(() => {
    visible.value = window.scrollY > scrollThreshold;
  });
};

// 平滑滚动到页面顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
  // 2. 点击后让按钮失去焦点，移除 :focus 状态
  buttonRef.value?.blur();
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // 组件挂载时检查一次初始状态
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.back-to-top {
  position: fixed;
  right: 32px;
  bottom: 48px;
  z-index: 999;
  background: linear-gradient(135deg, #6d8cf0 60%, #8fa7e9 100%);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 52px;
  height: 52px;
  box-shadow: 0 4px 16px rgba(109, 140, 240, 0.18);
  cursor: pointer;
  opacity: 0.88;
  transition:
    opacity 0.2s,
    background 0.3s,
    transform 0.18s cubic-bezier(.4,2,.6,1);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: gradient-move 2.5s ease-in-out infinite alternate;
  outline: none;
}

.back-to-top:hover,
.back-to-top:focus {
  opacity: 1;
  background: linear-gradient(135deg, #5778d0 60%, #6d8cf0 100%);
  transform: scale(1.08);
  box-shadow: 0 8px 24px rgba(109, 140, 240, 0.22);
}

.back-to-top svg {
  width: 26px;
  height: 26px;
  stroke-width: 2.5;
  transition: transform 0.2s ease-out;
}

.back-to-top:hover svg {
  transform: translateY(-2px);
}

@keyframes gradient-move {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}

/* 出现/消失动画 */
.fade-in-up-enter-active,
.fade-in-up-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-in-up-enter-from,
.fade-in-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 600px) {
  .back-to-top {
    right: 16px;
    bottom: 24px;
    width: 42px;
    height: 42px;
  }
  .back-to-top svg {
    width: 22px;
    height: 22px;
  }
}
</style>