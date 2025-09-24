/**
 * 歌词处理公共模块
 * 提供LRC解析、歌词同步、滚动控制等功能
 * 可被多个页面复用
 */

window.LyricsHelper = window.LyricsHelper || {};

/**
 * 解析LRC歌词文件
 * @param {string} lrcContent - LRC文件内容
 * @returns {Array} 解析后的歌词数组
 */
LyricsHelper.parseLRC = function(lrcContent) {
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
        const time = minutes * 60 + seconds;
        lyricsArray.push({ time, text });
      }
    }
  });
  
  // 按时间排序
  return lyricsArray.sort((a, b) => a.time - b.time);
};

/**
 * 创建歌词滚动控制器
 * @param {HTMLElement} container - 歌词容器元素
 * @returns {Object} 滚动控制器对象
 */
LyricsHelper.createScrollController = function(container) {
  const controller = {
    isUserScrolling: false,
    scrollTimeout: null,
    container: container
  };
  
  // 监听用户手动滚动
  if (container) {
    container.addEventListener('scroll', function() {
      controller.isUserScrolling = true;
      clearTimeout(controller.scrollTimeout);
      // 3秒后恢复自动滚动
      controller.scrollTimeout = setTimeout(() => {
        controller.isUserScrolling = false;
      }, 3000);
    });
  }
  
  return controller;
};

/**
 * 显示歌词列表
 * @param {Array} lyricsData - 歌词数据
 * @param {HTMLElement} container - 容器元素
 * @param {Function} onLineClick - 歌词行点击回调
 */
LyricsHelper.displayLyrics = function(lyricsData, container, onLineClick) {
  if (!container || !lyricsData.length) return;
  
  // 清空现有内容
  container.innerHTML = '';
  
  // 生成歌词DOM
  lyricsData.forEach((lyric, index) => {
    const lineElement = document.createElement('div');
    lineElement.className = 'lyric-line';
    lineElement.setAttribute('data-time', lyric.time);
    lineElement.setAttribute('data-index', index);
    lineElement.textContent = lyric.text;
    lineElement.style.cursor = 'pointer';
    
    // 点击歌词跳转
    if (onLineClick && typeof onLineClick === 'function') {
      lineElement.addEventListener('click', function() {
        onLineClick(lyric.time, lyric.text, index);
      });
    }
    
    container.appendChild(lineElement);
  });
};

/**
 * 同步歌词高亮和滚动
 * @param {number} currentTime - 当前播放时间
 * @param {Array} lyricsData - 歌词数据
 * @param {HTMLElement} container - 歌词容器
 * @param {Object} scrollController - 滚动控制器
 * @param {boolean} forceScroll - 是否强制滚动
 */
LyricsHelper.syncLyrics = function(currentTime, lyricsData, container, scrollController, forceScroll = false) {
  if (!lyricsData.length || !container) return;
  
  const lyricsLines = container.querySelectorAll('.lyric-line[data-time]');
  if (!lyricsLines.length) return;
  
  let activeLine = null;
  
  // 找到当前时间对应的歌词行并移除所有高亮
  lyricsLines.forEach(line => {
    const time = parseFloat(line.getAttribute('data-time'));
    line.classList.remove('highlight');
    
    if (currentTime >= time) {
      activeLine = line;
    }
  });
  
  // 高亮当前歌词行
  if (activeLine) {
    activeLine.classList.add('highlight');
    
    // 自动滚动（如果用户没有手动滚动或强制滚动）
    if ((forceScroll || !scrollController.isUserScrolling)) {
      LyricsHelper.scrollToLyric(activeLine, container, forceScroll);
    }
  }
};

/**
 * 滚动到指定歌词行
 * @param {HTMLElement} lyricElement - 歌词行元素
 * @param {HTMLElement} container - 容器元素
 * @param {boolean} smooth - 是否平滑滚动
 */
LyricsHelper.scrollToLyric = function(lyricElement, container, smooth = false) {
  if (!lyricElement || !container) return;
  
  const containerHeight = container.clientHeight;
  const elementTop = lyricElement.offsetTop;
  const elementHeight = lyricElement.offsetHeight;
  
  // 计算目标滚动位置（让歌词显示在容器中央）
  const targetScrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);
  
  // 检查是否需要滚动
  if (Math.abs(container.scrollTop - targetScrollTop) > 5) {
    container.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: smooth ? 'smooth' : 'auto'
    });
  }
};

/**
 * 加载LRC文件
 * @param {string} lrcPath - LRC文件路径
 * @returns {Promise} 返回Promise对象
 */
LyricsHelper.loadLrcFile = function(lrcPath) {
  return fetch(lrcPath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(lrcText => {
      return LyricsHelper.parseLRC(lrcText);
    });
};

/**
 * 显示歌词加载错误
 * @param {HTMLElement} container - 容器元素
 * @param {Function} onRetry - 重试回调函数
 */
LyricsHelper.showError = function(container, onRetry) {
  if (!container) return;
  
  container.innerHTML = `
    <div style="text-align: center; padding: 40px; color: #999;">
      <p>😕</p>
      <p>歌词文件加载失败</p>
      <p style="font-size: 0.9rem;">请检查文件路径是否正确</p>
      ${onRetry ? `
        <button onclick="(${onRetry.toString()})()" 
                style="margin-top: 10px; padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">
          重新加载
        </button>
      ` : ''}
    </div>
  `;
};

/**
 * 创建播放器状态控制器
 * 用于处理播放器的拖动状态
 */
LyricsHelper.createPlayerStateController = function() {
  return {
    isUserSeeking: false,
    
    // 开始拖动
    startSeeking: function() {
      this.isUserSeeking = true;
    },
    
    // 结束拖动
    endSeeking: function(callback) {
      setTimeout(() => {
        this.isUserSeeking = false;
        if (callback && typeof callback === 'function') {
          callback();
        }
      }, 100);
    }
  };
};

console.log('LyricsHelper 公共模块已加载');