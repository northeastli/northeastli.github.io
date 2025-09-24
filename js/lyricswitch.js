const lyrics = [
  "雪山千古冷，独照峨眉峰",
  "风起时，我在原地等你",
  "岁月静好，只因有人陪伴",
  "夜色温柔，月光洒满心间"
];

const lyricBox = document.getElementById("lyric-box");

function getRandomLyric() {
  const index = Math.floor(Math.random() * lyrics.length);
  return lyrics[index];
}

function updateLyric() {
  lyricBox.style.opacity = 0; // 渐隐
  setTimeout(() => {
    lyricBox.textContent = getRandomLyric();
    lyricBox.style.opacity = 1; // 渐现
  }, 500);
}

// 自动轮播：每 5 秒更新一次
setInterval(updateLyric, 5000);

// 点击歌词框更新
lyricBox.addEventListener("click", updateLyric);

// 页面切换回来更新
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) updateLyric();
});
