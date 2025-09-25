const track = document.querySelector('.carousel-track');
const originalCards = Array.from(track.children);
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');

// 创建无缝循环的卡片数组
function createInfiniteLoop() {
  // 克隆前面几张卡片到末尾
  const clonesToEnd = originalCards.slice(0, 3);
  clonesToEnd.forEach(card => {
    const clone = card.cloneNode(true);
    clone.classList.add('clone');
    track.appendChild(clone);
  });
  
  // 克隆后面几张卡片到开头
  const clonesToStart = originalCards.slice(-3);
  clonesToStart.reverse().forEach(card => {
    const clone = card.cloneNode(true);
    clone.classList.add('clone');
    track.insertBefore(clone, track.firstChild);
  });
}

// 初始化无缝循环
createInfiniteLoop();
const allCards = Array.from(track.children);

// 配置参数
const VISIBLE_CARDS = 5; // 每次显示的卡片数量
let centerIndex = Math.floor(VISIBLE_CARDS / 2); // 中间位置索引 (2)
let currentCenterCard = 3; // 从第4张开始（跳过前面的克隆）
let realCurrentIndex = 0; // 实际的原始卡片索引

// 自动轮播配置
let autoPlayInterval;
const AUTO_PLAY_SPEED = 3000; // 自动轮播间隔时间（3秒）
let isAutoPlaying = true; // 是否启用自动轮播

// 无缝循环辅助函数
function getShortestDistance(from, to, total) {
  const direct = to - from;
  const wrap_forward = direct + total;
  const wrap_backward = direct - total;
  
  // 选择绝对值最小的路径
  if (Math.abs(direct) <= Math.abs(wrap_forward) && Math.abs(direct) <= Math.abs(wrap_backward)) {
    return direct;
  } else if (Math.abs(wrap_forward) <= Math.abs(wrap_backward)) {
    return wrap_forward;
  } else {
    return wrap_backward;
  }
}

function updateCarousel(instant = false) {
  // 更新卡片状态和3D效果
  allCards.forEach((card, i) => {
    // 清除所有状态类
    card.classList.remove('active', 'prev-1', 'prev-2', 'prev-3', 'next-1', 'next-2', 'next-3', 'hidden');
    
    // 计算相对于中心的位置
    const relativePosition = i - currentCenterCard;
    
    // 应用对应的状态类和3D变换
    if (relativePosition === 0) {
      // 中心卡片
      card.classList.add('active');
    } else if (relativePosition === -1) {
      // 左侧第一层
      card.classList.add('prev-1');
    } else if (relativePosition === -2) {
      // 左侧第二层
      card.classList.add('prev-2');
    } else if (relativePosition === -3) {
      // 左侧第三层
      card.classList.add('prev-3');
    } else if (relativePosition === 1) {
      // 右侧第一层
      card.classList.add('next-1');
    } else if (relativePosition === 2) {
      // 右侧第二层
      card.classList.add('next-2');
    } else if (relativePosition === 3) {
      // 右侧第三层
      card.classList.add('next-3');
    } else {
      // 完全隐藏的卡片
      card.classList.add('hidden');
    }
  });
  
  // 更新实际当前索引
  realCurrentIndex = (currentCenterCard - 3 + originalCards.length) % originalCards.length;
}

// 自动轮播功能
function startAutoPlay() {
  if (autoPlayInterval) clearInterval(autoPlayInterval);
  autoPlayInterval = setInterval(() => {
    if (isAutoPlaying) {
      nextSlide();
    }
  }, AUTO_PLAY_SPEED);
}

function stopAutoPlay() {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
  }
}

function nextSlide() {
  currentCenterCard++;
  
  // 如果到达克隆区域的边界，循环回去
  if (currentCenterCard >= allCards.length - 2) {
    currentCenterCard = 3; // 跳回真实卡片的开始
  }
  
  updateCarousel();
}

function prevSlide() {
  currentCenterCard--;
  
  // 如果到达克隆区域的边界，循环回去  
  if (currentCenterCard < 3) {
    currentCenterCard = allCards.length - 3; // 跳到真实卡片的末尾
  }
  
  updateCarousel();
}

// 按钮点击事件 - 轮盘效果，循环移动
prevBtn.addEventListener('click', () => {
  stopAutoPlay(); // 暂停自动轮播
  prevSlide();
  setTimeout(() => {
    if (isAutoPlaying) startAutoPlay(); // 2秒后恢复自动轮播
  }, 2000);
});

nextBtn.addEventListener('click', () => {
  stopAutoPlay(); // 暂停自动轮播
  nextSlide();
  setTimeout(() => {
    if (isAutoPlaying) startAutoPlay(); // 2秒后恢复自动轮播
  }, 2000);
});

// 点击功能 - 区分中心卡片和侧边卡片
allCards.forEach((card, index) => {
  card.addEventListener('click', () => {
    stopAutoPlay(); // 点击时暂停自动轮播
    
    if (card.classList.contains('active')) {
      // 点击中心卡片 - 跳转到页面
      const link = card.dataset.link;
      if (link && link !== '#') {
        window.location.href = link;
      }
    } else if (card.classList.contains('visible')) {
      // 点击侧边卡片 - 将其移动到中心
      currentCenterCard = index;
      updateCarousel();
      
      // 2秒后恢复自动轮播
      setTimeout(() => {
        if (isAutoPlaying) startAutoPlay();
      }, 2000);
    }
  });
  
  // 鼠标悬停时暂停自动轮播
  card.addEventListener('mouseenter', () => {
    if (card.classList.contains('visible')) {
      card.style.cursor = 'pointer';
      stopAutoPlay();
    }
  });
  
  // 鼠标离开时恢复自动轮播
  card.addEventListener('mouseleave', () => {
    if (isAutoPlaying) {
      startAutoPlay();
    }
  });
  
  // 双击任何可见卡片都能跳转（备用功能）
  card.addEventListener('dblclick', () => {
    if (card.classList.contains('visible')) {
      const link = card.dataset.link;
      if (link && link !== '#') {
        window.location.href = link;
      }
    }
  });
});

// 键盘导航
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    prevBtn.click();
  } else if (e.key === 'ArrowRight') {
    nextBtn.click();
  }
});

// 初始化
updateCarousel();
startAutoPlay(); // 启动自动轮播

// 页面失去焦点时暂停，获得焦点时恢复
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopAutoPlay();
  } else if (isAutoPlaying) {
    startAutoPlay();
  }
});
