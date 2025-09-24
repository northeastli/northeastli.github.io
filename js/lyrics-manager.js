/**
 * 歌词管理器 - 可复用的歌词同步功能
 * 支持APlayer播放器的歌词同步、高亮和滚动
 */

class LyricsManager {
  constructor(options = {}) {
    // 配置选项
    this.options = {
      lyricsContainerId: 'lyrics-text',  // 歌词容器ID
      highlightClass: 'highlight',       // 高亮样式类名
      scrollTimeout: 2500,              // 用户滚动后恢复自动滚动的延迟时间
      syncDelay: 200,                   // 拖拽进度条后同步歌词的延迟时间
      clickDelay: 100,                  // 点击进度条后同步歌词的延迟时间
      progressBarSelector: '.aplayer-bar-wrap', // 进度条选择器
      ...options
    };

    // 状态变量
    this.lyricsContainer = document.getElementById(this.options.lyricsContainerId);
    this.lines = [];
    this.isUserScrolling = false;
    this.scrollTimeout = null;
    this.isUserSeeking = false;
    this.wasUserSeeking = false;
    this.ap = null; // APlayer实例

    // 初始化
    this.init();
  }

  /**
   * 初始化歌词管理器
   */
  init() {
    if (!this.lyricsContainer) {
      console.warn('歌词容器未找到:', this.options.lyricsContainerId);
      return;
    }

    // 绑定用户滚动事件
    this.lyricsContainer.addEventListener('scroll', () => {
      this.isUserScrolling = true;
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        this.isUserScrolling = false;
      }, this.options.scrollTimeout);
    });
  }

  /**
   * 绑定APlayer实例
   * @param {Object} aplayer - APlayer实例或PlayerManager实例
   */
  bindPlayer(aplayer) {
    // 如果传入的是PlayerManager实例，获取其APlayer
    if (aplayer && typeof aplayer.getPlayer === 'function') {
      this.ap = aplayer.getPlayer();
    } else {
      this.ap = aplayer;
    }
    
    // 等待APlayer准备完成
    this.ap.on('canplay', () => {
      console.log('LyricsManager: APlayer准备完成');
      
      // 绑定拖拽事件
      this.bindSeekEvents();
      
      // 绑定进度条点击事件
      this.bindProgressBarClick();
    });

    // 监听歌曲切换事件
    this.ap.on('listswitch', (index) => {
      console.log('LyricsManager: 切换到歌曲', index.index);
      const currentAudio = this.ap.list.audios[index.index];
      if (currentAudio.lrc) {
        this.loadLyrics(currentAudio.lrc);
      }
    });

    // 监听时间更新事件
    this.ap.on('timeupdate', () => {
      if (!this.isUserSeeking) {
        this.syncLyrics();
      }
    });

    // 初始加载第一首歌的歌词
    setTimeout(() => {
      if (this.ap.list.audios[0] && this.ap.list.audios[0].lrc) {
        this.loadLyrics(this.ap.list.audios[0].lrc);
      }
    }, 1000);
  }

  /**
   * 绑定拖拽进度条事件
   */
  bindSeekEvents() {
    // 监听开始拖动
    this.ap.on('seeking', () => {
      console.log('LyricsManager: 开始拖动进度条');
      this.isUserSeeking = true;
      this.wasUserSeeking = true;
    });

    // 监听拖动结束
    this.ap.on('seeked', () => {
      console.log('LyricsManager: 拖动进度条结束，当前时间:', this.ap.audio.currentTime);
      
      this.isUserSeeking = false;
      this.wasUserSeeking = false;
      
      // 延迟同步歌词，确保APlayer完全更新了currentTime
      setTimeout(() => {
        console.log('LyricsManager: 延迟后的当前时间:', this.ap.audio.currentTime);
        if (this.ap.audio.currentTime >= 0) {
          this.syncLyrics(true);
        }
      }, this.options.syncDelay);
    });
  }

  /**
   * 绑定进度条点击事件
   */
  bindProgressBarClick() {
    setTimeout(() => {
      const progressBar = document.querySelector(this.options.progressBarSelector);
      if (progressBar) {
        console.log('LyricsManager: 找到进度条，绑定点击事件');
        progressBar.addEventListener('click', (e) => {
          console.log('LyricsManager: 进度条被点击');
          
          const rect = progressBar.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const percentage = Math.max(0, Math.min(1, clickX / rect.width));
          const targetTime = percentage * this.ap.audio.duration;
          
          console.log('LyricsManager: 计算目标时间:', targetTime, '秒');
          
          try {
            this.ap.audio.currentTime = targetTime;
            setTimeout(() => {
              console.log('LyricsManager: 手动设置后的当前时间:', this.ap.audio.currentTime);
              this.syncLyrics(true);
            }, this.options.clickDelay);
          } catch (error) {
            console.error('LyricsManager: 设置时间失败:', error);
          }
        });
      } else {
        console.warn('LyricsManager: 未找到进度条元素');
      }
    }, 500);
  }

  /**
   * 同步歌词高亮和滚动
   * @param {boolean} forceScroll - 是否强制滚动
   */
  syncLyrics(forceScroll = false) {
    if (!this.ap || !this.ap.audio) return;

    const currentTime = this.ap.audio.currentTime;
    let activeLine = null;

    // 遍历所有歌词行，找到当前应该高亮的行
    this.lines.forEach(line => {
      const time = parseFloat(line.dataset.time);
      if (currentTime >= time) activeLine = line;
      line.classList.remove(this.options.highlightClass);
    });

    if (activeLine) {
      // 高亮当前歌词行
      activeLine.classList.add(this.options.highlightClass);

      // 自动滚动到当前歌词
      if (forceScroll || !this.isUserScrolling) {
        const targetScrollTop = activeLine.offsetTop - 
          this.lyricsContainer.clientHeight / 2 + 
          activeLine.offsetHeight / 2;
        
        if (Math.abs(this.lyricsContainer.scrollTop - targetScrollTop) > 2) {
          this.lyricsContainer.scrollTop = targetScrollTop;
        }
      }
    }
  }

  /**
   * 解析LRC歌词文件
   * @param {string} lrc - LRC歌词内容
   * @returns {Array} 解析后的歌词数组
   */
  parseLRC(lrc) {
    const lines = lrc.split('\n');
    const result = [];
    
    lines.forEach(line => {
      const match = line.match(/\[(\d+):(\d+(\.\d+)?)\](.*)/);
      if (match) {
        const min = parseInt(match[1], 10);
        const sec = parseFloat(match[2]);
        const text = match[4].trim();
        result.push({ time: min * 60 + sec, text });
      }
    });
    
    return result;
  }

  /**
   * 加载歌词文件
   * @param {string} lrcPath - 歌词文件路径
   */
  loadLyrics(lrcPath) {
    console.log('LyricsManager: 开始加载歌词文件:', lrcPath);
    
    fetch(lrcPath)
      .then(res => res.text())
      .then(lrcText => {
        const lyricsData = this.parseLRC(lrcText);
        console.log('LyricsManager: 歌词解析完成，共', lyricsData.length, '行');

        // 清空并生成新的歌词DOM
        this.lyricsContainer.innerHTML = '';
        lyricsData.forEach(line => {
          const p = document.createElement('p');
          p.dataset.time = line.time;
          p.textContent = line.text;
          this.lyricsContainer.appendChild(p);
        });

        // 更新歌词行引用
        this.lines = this.lyricsContainer.querySelectorAll('p');
        console.log('LyricsManager: 歌词DOM生成完成');
      })
      .catch(err => {
        console.error('LyricsManager: 歌词文件加载失败', err);
        this.lyricsContainer.innerHTML = '<p>歌词加载失败</p>';
      });
  }

  /**
   * 手动加载歌词内容（用于直接传入歌词文本）
   * @param {string} lrcText - 歌词文本内容
   */
  loadLyricsText(lrcText) {
    const lyricsData = this.parseLRC(lrcText);
    
    this.lyricsContainer.innerHTML = '';
    lyricsData.forEach(line => {
      const p = document.createElement('p');
      p.dataset.time = line.time;
      p.textContent = line.text;
      this.lyricsContainer.appendChild(p);
    });

    this.lines = this.lyricsContainer.querySelectorAll('p');
  }

  /**
   * 清空歌词
   */
  clearLyrics() {
    if (this.lyricsContainer) {
      this.lyricsContainer.innerHTML = '';
    }
    this.lines = [];
  }

  /**
   * 销毁歌词管理器
   */
  destroy() {
    // 清除定时器
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    // 解绑事件
    if (this.lyricsContainer) {
      this.lyricsContainer.removeEventListener('scroll', this.handleScroll);
    }

    // 清空引用
    this.ap = null;
    this.lines = [];
    this.lyricsContainer = null;
  }
}

// 导出类（支持ES6模块和全局使用）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LyricsManager;
} else {
  window.LyricsManager = LyricsManager;
}