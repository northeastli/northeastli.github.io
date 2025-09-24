/**
 * 现场演出详情页面交互功能
 * 包含标签切换、视频控制等功能
 * 命名空间: LiveDetailPage - 避免与其他JS文件冲突
 */

// 使用命名空间避免全局变量冲突
window.LiveDetailPage = window.LiveDetailPage || {};

// 等待页面加载完成
document.addEventListener('DOMContentLoaded', function() {
  
  // 只在现场演出详情页面执行
  if (document.querySelector('.live-detail')) {
    console.log('现场演出详情页面 - 开始初始化');
    
    // ==========================================
    // 标签切换功能
    // ==========================================
    LiveDetailPage.initTabSwitching();
    
    // ==========================================
    // 视频播放器增强功能
    // ==========================================
    LiveDetailPage.initVideoPlayer();
    
    // ==========================================
    // 页面滚动优化
    // ==========================================
    LiveDetailPage.initScrollOptimization();
    
    // ==========================================
  // 歌词同步功能
  // ==========================================
  LiveDetailPage.initLyricsSync();
  
  console.log('现场演出详情页面 - 初始化完成');
  }
});

/**
 * 初始化标签切换功能
 */
LiveDetailPage.initTabSwitching = function() {
  const tabs = document.querySelectorAll('.live-detail .tab');
  const contents = document.querySelectorAll('.live-detail .tab-content');

  if (tabs.length === 0 || contents.length === 0) {
    console.warn('LiveDetailPage: 未找到标签页元素');
    return;
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // 移除所有活动状态
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      // 添加当前选中状态
      this.classList.add('active');
      const targetId = this.getAttribute('data-target');
      const targetContent = document.getElementById(targetId);
      
      if (targetContent) {
        targetContent.classList.add('active');
        
        // 添加切换动画效果
        targetContent.style.opacity = '0';
        setTimeout(() => {
          targetContent.style.opacity = '1';
        }, 50);
      }
    });
  });

  console.log('LiveDetailPage: 标签切换功能已初始化');
};

/**
 * 初始化视频播放器增强功能
 */
LiveDetailPage.initVideoPlayer = function() {
  const video = document.querySelector('.live-detail video');
  
  if (!video) {
    console.warn('LiveDetailPage: 未找到视频元素');
    return;
  }

  // 视频加载完成事件
  video.addEventListener('loadedmetadata', function() {
    console.log('LiveDetailPage: 视频元数据加载完成');
    LiveDetailPage.updateVideoInfo(this);
  });

  // 视频播放事件
  video.addEventListener('play', function() {
    console.log('LiveDetailPage: 视频开始播放');
  });

  // 视频暂停事件
  video.addEventListener('pause', function() {
    console.log('LiveDetailPage: 视频暂停');
  });

  // 视频结束事件
  video.addEventListener('ended', function() {
    console.log('LiveDetailPage: 视频播放结束');
    // 可以在这里添加播放结束后的逻辑
  });

  // 视频时间更新事件 - 用于歌词同步
  video.addEventListener('timeupdate', function() {
    LiveDetailPage.syncLyrics(this.currentTime);
  });

  // 视频跳转事件 - 用于歌词同步
  video.addEventListener('seeked', function() {
    console.log('LiveDetailPage: 视频跳转到', this.currentTime);
    LiveDetailPage.syncLyrics(this.currentTime, true); // 强制滚动
  });

  // 视频错误处理
  video.addEventListener('error', function(e) {
    console.error('LiveDetailPage: 视频加载失败:', e);
    LiveDetailPage.showVideoError();
  });

  console.log('LiveDetailPage: 视频播放器功能已初始化');
};

/**
 * 更新视频信息显示
 */
LiveDetailPage.updateVideoInfo = function(video) {
  const duration = video.duration;
  const infoCard = document.querySelector('.live-detail .video-info-card');
  
  if (duration && infoCard) {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    const durationText = `${minutes}分${seconds}秒`;
    
    // 更新时长信息
    const durationP = infoCard.querySelector('p:first-of-type');
    if (durationP) {
      durationP.innerHTML = `<strong>视频时长:</strong> ${durationText}`;
    }
  }
};

/**
 * 显示视频加载错误信息
 */
LiveDetailPage.showVideoError = function() {
  const videoContainer = document.querySelector('.live-detail .video-container');
  if (videoContainer) {
    videoContainer.innerHTML = `
      <div style="height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f5f5f5; color: #666;">
        <div style="font-size: 48px; margin-bottom: 20px; color: #999;">⚠️</div>
        <h3 style="margin: 0 0 10px 0; color: #333;">视频加载失败</h3>
        <p style="margin: 0; text-align: center;">请检查视频文件是否存在，或稍后重试</p>
        <button onclick="location.reload()" style="margin-top: 15px; padding: 8px 16px; background: #1e3c72; color: white; border: none; border-radius: 4px; cursor: pointer;">
          重新加载页面
        </button>
      </div>
    `;
  }
};

/**
 * 初始化页面滚动优化
 */
LiveDetailPage.initScrollOptimization = function() {
  // 平滑滚动到锚点 - 只处理现场演出页面内的链接
  const links = document.querySelectorAll('.live-detail a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // 返回顶部功能（当页面滚动时显示）- 避免与其他页面冲突
  let backToTopButton = null;
  
  function handleScroll() {
    // 只在现场演出详情页面添加返回顶部按钮
    if (!document.querySelector('.live-detail')) return;
    
    if (window.pageYOffset > 300) {
      if (!backToTopButton) {
        LiveDetailPage.createBackToTopButton();
        backToTopButton = document.querySelector('.live-detail-back-to-top');
      }
      if (backToTopButton) {
        backToTopButton.style.display = 'block';
      }
    } else if (backToTopButton) {
      backToTopButton.style.display = 'none';
    }
  }
  
  window.addEventListener('scroll', handleScroll);

  console.log('LiveDetailPage: 页面滚动优化已初始化');
};

/**
 * 创建返回顶部按钮
 */
LiveDetailPage.createBackToTopButton = function() {
  // 避免重复创建
  if (document.querySelector('.live-detail-back-to-top')) return;
  
  const backToTopButton = document.createElement('button');
  backToTopButton.innerHTML = '↑';
  backToTopButton.className = 'live-detail-back-to-top';
  backToTopButton.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    background: #1e3c72;
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 20px;
    cursor: pointer;
    z-index: 1000;
    display: none;
    transition: all 0.3s;
  `;
  
  backToTopButton.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  backToTopButton.addEventListener('mouseenter', function() {
    this.style.background = '#2a4d8d';
    this.style.transform = 'scale(1.1)';
  });

  backToTopButton.addEventListener('mouseleave', function() {
    this.style.background = '#1e3c72';
    this.style.transform = 'scale(1)';
  });

  document.body.appendChild(backToTopButton);
};

/**
 * 工具函数：格式化时间
 */
LiveDetailPage.formatTime = function(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * 工具函数：格式化文件大小
 */
LiveDetailPage.formatFileSize = function(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 初始化歌词同步功能
 */
LiveDetailPage.initLyricsSync = function() {
  // 加载LRC歌词文件
  LiveDetailPage.loadLyricsFile();
  
  // 初始化歌词滚动变量
  LiveDetailPage.lyricsData = [];
  LiveDetailPage.isUserScrolling = false;
  LiveDetailPage.scrollTimeout = null;
  
  // 监听用户手动滚动歌词
  const lyricsContainer = document.getElementById('lyrics-text');
  if (lyricsContainer) {
    lyricsContainer.addEventListener('scroll', function() {
      LiveDetailPage.isUserScrolling = true;
      clearTimeout(LiveDetailPage.scrollTimeout);
      // 2.5秒后恢复自动滚动
      LiveDetailPage.scrollTimeout = setTimeout(() => {
        LiveDetailPage.isUserScrolling = false;
      }, 2500);
    });
  }
  
  console.log('LiveDetailPage: 歌词同步功能已初始化');
};

/**
 * 加载LRC歌词文件
 */
LiveDetailPage.loadLyricsFile = function() {
  const lyricsPath = '../../../../../audio/live/北京青年广播牢骚.lrc';
  
  fetch(lyricsPath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(lrcText => {
      console.log('LiveDetailPage: LRC文件加载成功');
      LiveDetailPage.lyricsData = LiveDetailPage.parseLRC(lrcText);
      LiveDetailPage.displayLyrics();
    })
    .catch(error => {
      console.error('LiveDetailPage: LRC文件加载失败:', error);
      LiveDetailPage.showLyricsError();
    });
};

/**
 * 解析LRC歌词文件
 */
LiveDetailPage.parseLRC = function(lrcContent) {
  const lines = lrcContent.split('\n');
  const lyricsArray = [];
  
  lines.forEach(line => {
    // 匹配时间戳格式 [mm:ss.xx] 或 [mm:ss]
    const match = line.match(/\[(\d+):(\d+(?:\.\d+)?)\](.*)/);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      const text = match[3].trim();
      
      if (text) { // 只保存有内容的歌词行
        lyricsArray.push({
          time: minutes * 60 + seconds,
          text: text
        });
      }
    }
  });
  
  // 按时间排序
  lyricsArray.sort((a, b) => a.time - b.time);
  console.log('LiveDetailPage: 解析到', lyricsArray.length, '行歌词');
  
  return lyricsArray;
};

/**
 * 显示歌词内容
 */
LiveDetailPage.displayLyrics = function() {
  const lyricsContainer = document.getElementById('lyrics-text');
  if (!lyricsContainer || !LiveDetailPage.lyricsData.length) {
    return;
  }
  
  // 清空现有内容
  lyricsContainer.innerHTML = '<h2>歌词</h2>';
  
  // 生成歌词DOM
  LiveDetailPage.lyricsData.forEach((lyric, index) => {
    const p = document.createElement('p');
    p.setAttribute('data-time', lyric.time);
    p.setAttribute('data-index', index);
    p.textContent = lyric.text;
    p.style.cursor = 'pointer';
    
    // 点击歌词跳转到对应时间
    p.addEventListener('click', function() {
      const video = document.querySelector('.live-detail video');
      if (video) {
        video.currentTime = lyric.time;
        LiveDetailPage.syncLyrics(lyric.time, true);
      }
    });
    
    lyricsContainer.appendChild(p);
  });
  
  console.log('LiveDetailPage: 歌词显示完成');
};

/**
 * 同步歌词高亮和滚动
 */
LiveDetailPage.syncLyrics = function(currentTime, forceScroll = false) {
  if (!LiveDetailPage.lyricsData.length) return;
  
  const lyricsContainer = document.getElementById('lyrics-text');
  if (!lyricsContainer) return;
  
  const lyricsLines = lyricsContainer.querySelectorAll('p[data-time]');
  if (!lyricsLines.length) return;
  
  let activeLine = null;
  let activeIndex = -1;
  
  // 找到当前时间对应的歌词行
  lyricsLines.forEach((line, index) => {
    const time = parseFloat(line.getAttribute('data-time'));
    line.classList.remove('highlight');
    
    if (currentTime >= time) {
      activeLine = line;
      activeIndex = index;
    }
  });
  
  // 高亮当前歌词行
  if (activeLine) {
    activeLine.classList.add('highlight');
    
    // 自动滚动（如果用户没有手动滚动或强制滚动）
    if (!LiveDetailPage.isUserScrolling || forceScroll) {
      LiveDetailPage.scrollToLyric(activeLine, lyricsContainer);
    }
  }
};

/**
 * 滚动到指定歌词行
 */
LiveDetailPage.scrollToLyric = function(lyricElement, container) {
  if (!lyricElement || !container) return;
  
  const containerHeight = container.clientHeight;
  const containerScrollTop = container.scrollTop;
  const elementTop = lyricElement.offsetTop;
  const elementHeight = lyricElement.offsetHeight;
  
  // 计算目标滚动位置（让歌词显示在容器中央）
  const targetScrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);
  
  // 平滑滚动
  container.scrollTo({
    top: Math.max(0, targetScrollTop),
    behavior: 'smooth'
  });
};

/**
 * 显示歌词加载错误
 */
LiveDetailPage.showLyricsError = function() {
  const lyricsContainer = document.getElementById('lyrics-text');
  if (lyricsContainer) {
    lyricsContainer.innerHTML = `
      <h2>歌词</h2>
      <div style="text-align: center; padding: 40px; color: #999;">
        <p>📄</p>
        <p>歌词文件加载失败</p>
        <p style="font-size: 0.9rem;">请检查文件路径是否正确</p>
        <button onclick="LiveDetailPage.loadLyricsFile()" style="margin-top: 10px; padding: 6px 12px; background: #1e3c72; color: white; border: none; border-radius: 4px; cursor: pointer;">
          重新加载
        </button>
      </div>
    `;
  }
};

console.log('LiveDetailPage 模块已加载');