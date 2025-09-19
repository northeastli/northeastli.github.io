const track = document.querySelector('.carousel-track');
const cards = Array.from(track.children);
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');
let currentIndex = 0;

function updateCarousel() {
  const cardWidth = cards[0].offsetWidth + 20;
  track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
}

prevBtn.addEventListener('click', () => {
  currentIndex = Math.max(currentIndex - 1, 0);
  updateCarousel();
});

nextBtn.addEventListener('click', () => {
  currentIndex = Math.min(currentIndex + 1, cards.length - 1);
  updateCarousel();
});

cards.forEach(card => {
  card.addEventListener('click', () => {
    const link = card.dataset.link;
    if (link && link !== '#') window.open(link, '_blank');
  });
});
