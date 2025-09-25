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
  console.log(`更新轮播状态: currentCenterCard = ${currentCenterCard}`);
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
  }, 0);
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

// 渐进式移动到目标位置的函数
function moveToTarget(targetIndex) {
  console.log(`目标移动: 从 ${currentCenterCard} 到 ${targetIndex}`);
  
  if (targetIndex === currentCenterCard) {
    console.log('已经在目标位置');
    return; // 已经在目标位置
  }
  
  // 计算最短路径距离
  const totalCards = allCards.length;
  let distance = targetIndex - currentCenterCard;
  
  // 处理循环边界，选择最短路径
  if (Math.abs(distance) > Math.abs(distance + totalCards)) {
    distance = distance + totalCards;
  }
  if (Math.abs(distance) > Math.abs(distance - totalCards)) {
    distance = distance - totalCards;
  }
  
  console.log(`最短距离: ${distance}`);
  
  // 确定移动方向
  const step = distance > 0 ? 1 : -1;
  let stepsRemaining = Math.abs(distance);
  
  // 创建动画序列
  function animateStep() {
    if (stepsRemaining > 0) {
      console.log(`剩余步数: ${stepsRemaining}, 当前位置: ${currentCenterCard}`);
      
      // 每步移动一个位置
      if (step > 0) {
        nextSlide(); // 向右滚动
      } else {
        prevSlide(); // 向左滚动
      }
      
      stepsRemaining--;
      
      // 继续下一步
      if (stepsRemaining > 0) {
        setTimeout(animateStep, 350); // 每350ms移动一步，稍微慢一点
      } else {
        console.log('到达目标位置');
        // 到达目标位置，强制更新一次确保状态正确
        setTimeout(() => {
          updateCarousel();
          // 2秒后恢复自动轮播
          setTimeout(() => {
            if (isAutoPlaying) startAutoPlay();
          }, 2000);
        }, 100);
      }
    }
  }
  
  // 开始动画
  animateStep();
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
