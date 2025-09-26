// 深海引导层：波纹动画 + 音频自动播放 + 进入按钮
(function(){
  const overlay = document.getElementById('intro-overlay');
  if (!overlay) return;
  const canvas = document.getElementById('intro-canvas');
  const ctx = canvas.getContext('2d');
  const enterBtn = document.getElementById('intro-enter-btn');
  const playBtn = document.getElementById('intro-play-btn');
  const pauseBtn = document.getElementById('intro-pause-btn');
  const vinyl = document.getElementById('intro-vinyl');

  // 主题音频
  const audio = new Audio('audio/shenhai.mp3');
  audio.loop = true;
  audio.volume = 0.7;

  // 自适应尺寸
  function resize(){
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  // 简洁的“深海波纹网状”动画：多层正弦波 + 泛光粒子
  const waves = [
    { amp: 18, len: 160, spd: 0.6, color: 'rgba(93,178,255,0.25)' },
    { amp: 28, len: 240, spd: 0.45, color: 'rgba(255,255,255,0.08)' },
    { amp: 14, len: 120, spd: 0.75, color: 'rgba(255,255,255,0.05)' }
  ];
  const particles = Array.from({length: 60}, _ => ({
    x: Math.random(), y: Math.random(), r: 1 + Math.random()*2, v: 0.05 + Math.random()*0.1
  }));

  let t0 = performance.now();
  function draw(now){
    const dt = (now - t0) / 1000; t0 = now;
    const w = canvas.clientWidth, h = canvas.clientHeight;

    // 背景渐变暗涌
    const grd = ctx.createLinearGradient(0,0,0,h);
    grd.addColorStop(0, '#0B3471');
    grd.addColorStop(1, '#072447');
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,w,h);

    // 波纹
    waves.forEach((wv, idx) => {
      ctx.beginPath();
      for (let x=0; x<=w; x+=12){
        const y = h*0.55 + Math.sin((x/w)*Math.PI*2 + now*0.001*wv.spd) * wv.amp
                 + Math.cos((x/w)*Math.PI*4 + now*0.0012*wv.spd) * (wv.amp*0.4);
        if (x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.strokeStyle = wv.color;
      ctx.lineWidth = idx===1 ? 1.2 : 0.8;
      ctx.stroke();
    });

    // 细网格（淡）
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    const grid = 60;
    for (let x=0;x<w;x+=grid){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
    for (let y=0;y<h;y+=grid){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }

    // 粒子浮动
    particles.forEach(p=>{
      p.y -= p.v*dt*8e-2; // 缓慢上浮
      if (p.y < -0.05) { p.x = Math.random(); p.y = 1.05; }
      const px = p.x * w, py = p.y * h;
      const r = p.r;
      const g = ctx.createRadialGradient(px,py,0, px,py,r*3);
      g.addColorStop(0,'rgba(255,255,255,0.25)');
      g.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(px,py,r,0,Math.PI*2); ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  // 尝试自动播放（可能被浏览器策略拦截）
  audio.play().then(()=>{
    // 自动播放成功：显示暂停，显示进入按钮，开始旋转
    pauseBtn && (pauseBtn.disabled = false);
    playBtn && (playBtn.disabled = true);
  enterBtn && (enterBtn.hidden = false);
    if (vinyl) vinyl.style.animation = 'vinyl-spin 5s linear infinite';
    overlay.classList.add('corners-visible');
  }).catch(()=>{
    // 自动播放失败：等待用户点击播放
  });

  // 进入按钮
  enterBtn?.addEventListener('click', async ()=>{
    try {
      await audio.play(); // 如果此前被拦截，点击后可播放
    } catch {}
    // 平滑淡出音量
    const start = audio.volume;
    const tStart = performance.now();
    function fade(){
      const k = Math.min(1, (performance.now()-tStart)/800);
      audio.volume = start * (1-k);
      if (k < 1) requestAnimationFrame(fade); else audio.pause();
    }
    fade();

    // 淡出遮罩
    overlay.classList.add('fade-out');
    setTimeout(()=>{
      overlay.remove();
    }, 750);
  });

  // 播放/暂停控制
  playBtn?.addEventListener('click', async ()=>{
    try {
      await audio.play();
      playBtn.disabled = true;
      pauseBtn.disabled = false;
  enterBtn.hidden = false; // 播放后显示进入
      if (vinyl) vinyl.style.animation = 'vinyl-spin 5s linear infinite';
      overlay.classList.add('corners-visible');
    } catch {}
  });

  pauseBtn?.addEventListener('click', ()=>{
    audio.pause();
    pauseBtn.disabled = true;
    playBtn.disabled = false;
    if (vinyl) vinyl.style.animation = 'vinyl-spin 0s linear infinite';
  });
})();
