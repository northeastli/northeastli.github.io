const track = document.querySelector('.carousel-track');
const cards = Array.from(track.children);
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');
let currentIndex = 0;

function updateCarousel() {
  cards.forEach((card, i) => {
    card.classList.remove('prev', 'active', 'next');

    if (i === currentIndex) {
      card.classList.add('active'); // 中间卡片
      card.style.transform = 'scale(1.1) translateY(0)';
      card.style.zIndex = 3;
      card.style.opacity = 1;
    } else if (i === currentIndex - 1) {
      card.classList.add('prev'); // 左边卡片
      card.style.transform = 'scale(0.85) translateY(30px)';
      card.style.zIndex = 2;
      card.style.opacity = 0.7;
    } else if (i === currentIndex + 1) {
      card.classList.add('next'); // 右边卡片
      card.style.transform = 'scale(0.85) translateY(30px)';
      card.style.zIndex = 2;
      card.style.opacity = 0.7;
    } else {
      // 其他隐藏或缩小
      card.style.transform = 'scale(0.7) translateY(50px)';
      card.style.zIndex = 1;
      card.style.opacity = 0;
    }
  });
}

// 按钮点击事件
prevBtn.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + cards.length) % cards.length;
  updateCarousel();
});

nextBtn.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % cards.length;
  updateCarousel();
});

// 点击跳转
cards.forEach(card => {
  card.addEventListener('click', () => {
    const link = card.dataset.link;
    if (link && link !== '#') window.open(link, '_blank');
  });
});

// 初始化
updateCarousel();
