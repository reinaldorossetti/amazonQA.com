/**
 * dashboard-reports.js
 * Renders the "Relatórios" tab: clickable report cards grid.
 * Depends on: dashboard-utils.js
 */

function renderReportsTab() {
  document.getElementById('reportsGrid').innerHTML = REPORTS.map(r => `
    <section class="report">
      <div class="report-title">
        <strong>${r.title}</strong>
        <span class="tag">${r.type}</span>
      </div>
      <div class="muted">${r.description}</div>
      <a class="btn" href="${r.href}">Abrir relatório</a>
    </section>
  `).join('');
}

document.addEventListener('DOMContentLoaded', renderReportsTab);
