/**
 * dashboard-tabs.js
 * Sticky tab navigation controller.
 */

function initTabs() {
  const tabBtns   = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById(`panel-${btn.dataset.tab}`);
      if (panel) panel.classList.add('active');

      // Rule: Reset to latest when clicking Metrics tab
      if (btn.dataset.tab === 'metrics' && typeof window.selectLatestHistoryItem === 'function') {
        window.selectLatestHistoryItem();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', initTabs);
