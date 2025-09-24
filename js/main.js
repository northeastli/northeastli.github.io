// 页面通用逻辑，可用于后续扩展
console.log("页面加载完成");

/**
 * 切换侧边栏显示/隐藏
 */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    if (sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      document.body.classList.remove('sidebar-open');
    } else {
      sidebar.classList.add('open');
      document.body.classList.add('sidebar-open');
    }
  }
}
