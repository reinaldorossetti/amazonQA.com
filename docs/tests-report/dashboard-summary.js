/**
 * dashboard-summary.js
 * Renders the "Resumo" tab: pyramid, totals, stats, and summary list.
 * Depends on: dashboard-utils.js
 */

function renderSummaryTab() {
  const counts = REPORTS.reduce(
    (acc, r) => {
      if (r.type === 'Unidade')              acc.unit++;
      if (r.type === 'Integração/Contrato')  acc.integration++;
      if (r.type === 'E2E')                  acc.e2e++;
      return acc;
    },
    { unit: 0, integration: 0, e2e: 0 }
  );

  document.getElementById('stats').innerHTML = `
    <div class="stat"><small>Relatórios E2E</small><strong>${counts.e2e}</strong></div>
    <div class="stat"><small>Integração/Contrato</small><strong>${counts.integration}</strong></div>
    <div class="stat"><small>Relatórios Unitários</small><strong>${counts.unit}</strong></div>
    <div class="stat"><small>Total de atalhos</small><strong>${REPORTS.length}</strong></div>
  `;

  document.getElementById('testSummary').innerHTML =
    TEST_SUMMARY_ITEMS.map(item => `<li>${item}</li>`).join('');

  document.getElementById('generatedAt').textContent =
    `Atualizado em: ${new Date().toLocaleString('pt-BR')}`;
}

/**
 * Called after CI data loads to update the grand total cards in the Resumo tab.
 */
function updateSummaryTotals(grandPassed, grandFailed) {
  const elPassed = document.getElementById('totalPassed');
  const elFailed = document.getElementById('totalFailed');
  const fmt = v => Number.isFinite(v) ? v : 0;
  if (elPassed) elPassed.textContent = fmt(grandPassed);
  if (elFailed) elFailed.textContent = fmt(grandFailed);
}

document.addEventListener('DOMContentLoaded', renderSummaryTab);
