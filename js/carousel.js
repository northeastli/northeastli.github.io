const track = document.querySelector('.carousel-track');
const originalCards = Array.from(track.children);
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');
const container = document.querySelector('.carousel-container');
const TRANSITION_MS = 500; // 与 .carousel-card 的 CSS 过渡时间保持一致
let actionSeq = 0; // 动作序列号，用于防竞态
let isAnimating = false; // 是否正在执行单步动画
let stepQueue = 0;       // 动作队列：>0 表示向右，<0 表示向左

function processQueue() {
  if (isAnimating || stepQueue === 0) return;
  const dir = stepQueue > 0 ? 1 : -1;
  isAnimating = true;
  if (dir > 0) {
    nextSlide();
  } else {
    prevSlide();
  }
  // 在过渡结束后再处理下一步，给无缝跳转保留一点余量
  setTimeout(() => {
    isAnimating = false;
    stepQueue -= dir;
    processQueue();
  }, TRANSITION_MS + 30);
}

function enqueueStep(dir) {
  stepQueue += dir; // dir: 1 为 next，-1 为 prev
  processQueue();
}

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
  console.log(`更新轮播状态: currentCenterCard = ${currentCenterCard}`);
  // 如需瞬时更新，则先禁用过渡动画
  if (instant) {
    allCards.forEach(card => card.classList.add('no-anim'));
  }

  // 清理并重新打标记（同步进行，交由CSS控制层级）
  allCards.forEach((card, i) => {
    card.classList.remove('active', 'prev-1', 'prev-2', 'prev-3', 'next-1', 'next-2', 'next-3', 'hidden');
    const relativePosition = i - currentCenterCard;

    if (relativePosition === 0) {
      card.classList.add('active');
      console.log(`卡片 ${i} 设为中心 (active)`);
    } else if (relativePosition === -1) {
      card.classList.add('prev-1');
    } else if (relativePosition === -2) {
      card.classList.add('prev-2');
    } else if (relativePosition === -3) {
      card.classList.add('prev-3');
    } else if (relativePosition === 1) {
      card.classList.add('next-1');
    } else if (relativePosition === 2) {
      card.classList.add('next-2');
    } else if (relativePosition === 3) {
      card.classList.add('next-3');
    } else {
      card.classList.add('hidden');
    }
  });
  
  // 更新实际当前索引
  realCurrentIndex = (currentCenterCard - 3 + originalCards.length) % originalCards.length;
  console.log(`实际索引: ${realCurrentIndex}`);
  
  // 调试：打印所有卡片的状态
  setTimeout(() => {
    console.log('=== 当前卡片状态 ===');
    allCards.forEach((card, i) => {
      const classes = Array.from(card.classList).filter(c => 
        ['active', 'prev-1', 'prev-2', 'prev-3', 'next-1', 'next-2', 'next-3', 'hidden'].includes(c)
      );
      const zIndex = window.getComputedStyle(card).zIndex;
      console.log(`卡片 ${i}: ${classes.join(', ')} (z-index: ${zIndex})`);
    });
    console.log('==================');
    // 解除瞬时更新的禁用动画
    if (instant) {
      allCards.forEach(card => card.classList.remove('no-anim'));
    }
  }, 0);
}

// 自动轮播功能
function startAutoPlay() {
  if (autoPlayInterval) clearInterval(autoPlayInterval);
  autoPlayInterval = setInterval(() => {
    if (isAutoPlaying) {
      enqueueStep(1);
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
  updateCarousel(false);
  // 如果到达末尾的首个克隆中心（index = allCards.length - 3），先播放这一步动画
  // 动画结束后瞬时跳回真实起点中心（index = 3），达到无缝衔接
  if (currentCenterCard === allCards.length - 3) {
    const mySeq = ++actionSeq;
    setTimeout(() => {
      // 仅当期间没有新的动作发生，且仍然停留在克隆边界时，才执行无缝跳转
      if (actionSeq === mySeq && currentCenterCard === allCards.length - 3) {
        currentCenterCard = 3;
        updateCarousel(true);
      }
    }, TRANSITION_MS);
  } else {
    actionSeq++; // 普通步进也推进序列，避免旧的 wrap 回调生效
  }
}

function prevSlide() {
  currentCenterCard--;
  updateCarousel(false);
  // 如果到达起点前的最后一个克隆中心（index = 2），先播放这一步动画
  // 动画结束后瞬时跳回真实末尾中心（index = allCards.length - 4）
  if (currentCenterCard === 2) {
    const mySeq = ++actionSeq;
    setTimeout(() => {
      if (actionSeq === mySeq && currentCenterCard === 2) {
        currentCenterCard = allCards.length - 4;
        updateCarousel(true);
      }
    }, TRANSITION_MS);
  } else {
    actionSeq++;
  }
}

// 按钮点击事件 - 轮盘效果，循环移动
prevBtn.addEventListener('click', () => {
  stopAutoPlay(); // 暂停自动轮播
  enqueueStep(-1);
  setTimeout(() => {
    if (isAutoPlaying) startAutoPlay(); // 2秒后恢复自动轮播
  }, 2000);
});

nextBtn.addEventListener('click', () => {
  stopAutoPlay(); // 暂停自动轮播
  enqueueStep(1);
  setTimeout(() => {
    if (isAutoPlaying) startAutoPlay(); // 2秒后恢复自动轮播
  }, 2000);
});

// 渐进式移动到目标位置的函数
function moveToTarget(targetIndex) {
  console.log(`目标移动: 从 ${currentCenterCard} 到 ${targetIndex}`);
  if (targetIndex === currentCenterCard) return;
  // 以最短路径为准（循环环形）
  const total = allCards.length;
  const distance = getShortestDistance(currentCenterCard, targetIndex, total);
  const dir = distance > 0 ? 1 : -1;
  const steps = Math.abs(distance);
  stopAutoPlay();
  stepQueue += dir * steps; // 入队所有步数
  processQueue();
  setTimeout(() => {
    if (isAutoPlaying) startAutoPlay();
  }, 2000);
}

// 点击功能 - 智能点击：中心卡片跳转，其他卡片滚动到中心
allCards.forEach((card, index) => {
  card.addEventListener('click', (e) => {
    stopAutoPlay(); // 点击时暂停自动轮播
    
    if (card.classList.contains('active')) {
      // 点击中心卡片 - 跳转到页面
      const link = card.dataset.link;
      if (link && link !== '#') {
        window.location.href = link;
      }
    } else {
      // 只有在明确点击卡片内容时才触发（降低灵敏度）
      const cardRect = card.getBoundingClientRect();
      const clickX = e.clientX;
      const clickY = e.clientY;
      
      // 检查点击是否在卡片的核心区域内（减少误触）
      const centerX = cardRect.left + cardRect.width / 2;
      const centerY = cardRect.top + cardRect.height / 2;
      const maxDistance = Math.min(cardRect.width, cardRect.height) * 0.4; // 点击范围缩小到40%
      
      const distance = Math.sqrt(
        Math.pow(clickX - centerX, 2) + Math.pow(clickY - centerY, 2)
      );
      
      if (distance <= maxDistance) {
        // 在核心区域内点击 - 执行滚动到中心
        console.log(`点击了卡片 ${index}，开始滚动到中心位置`);
        moveToTarget(index);
      }
    }
  });
  
  // 鼠标悬停效果 - 只对可见卡片明显响应
  card.addEventListener('mouseenter', () => {
    // 只暂停自动轮播，不再强制修改样式（让CSS处理）
    if (!card.classList.contains('active')) {
      stopAutoPlay();
    }
  });
  
  // 鼠标离开时恢复效果
  card.addEventListener('mouseleave', () => {
    // 恢复自动轮播
    if (isAutoPlaying) {
      startAutoPlay();
    }
  });
  
  // 双击任何卡片都能直接跳转（快捷功能）
  card.addEventListener('dblclick', () => {
    const link = card.dataset.link;
    if (link && link !== '#') {
      console.log(`双击跳转到: ${link}`);
      window.location.href = link;
    }
  });
});

// 捕获阶段的容器点击：当按钮覆盖在卡片上方时，优先判定是否点击了某个非激活卡片的“核心区域”
// 这样可以让“点击侧边/隐藏卡片滚动到中间”的能力不被按钮遮挡
if (container) {
  container.addEventListener('click', (e) => {
    // 仅在事件目标不是激活卡片本身，且不是直接点击到卡片监听已处理的情况下介入
    const clickX = e.clientX;
    const clickY = e.clientY;

    for (let i = 0; i < allCards.length; i++) {
      const card = allCards[i];
      if (card.classList.contains('active')) continue; // 不抢占中心卡片点击（保持原跳转）

      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const maxDistance = Math.min(rect.width, rect.height) * 0.4; // 与卡片点击判断保持一致
      const distance = Math.hypot(clickX - centerX, clickY - centerY);

      if (distance <= maxDistance) {
        // 命中某张非激活卡片的核心区域——优先执行滚动到中间
        stopAutoPlay();
        moveToTarget(i);
        // 阻止后续的按钮 click 处理，避免只滚动一步
        e.stopImmediatePropagation();
        e.preventDefault();
        return;
      }
    }
  }, true); // 使用捕获阶段，优先于按钮的冒泡监听
}

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
