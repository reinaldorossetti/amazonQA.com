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

  const t = (typeof translations !== 'undefined' && translations[currentLang]) || {};

  document.getElementById('stats').innerHTML = `
    <div class="stat"><small>${t.e2eResultsProject || 'Relatórios E2E'}</small><strong>${counts.e2e}</strong></div>
    <div class="stat"><small>${t.integrationContract || 'Integração/Contrato'}</small><strong>${counts.integration}</strong></div>
    <div class="stat"><small>${t.unitResultsProject || 'Relatórios Unitários'}</small><strong>${counts.unit}</strong></div>
    <div class="stat"><small>${currentLang === 'PT' ? 'Total de atalhos' : 'Total shortcuts'}</small><strong>${REPORTS.length}</strong></div>
  `;

  document.getElementById('testSummary').innerHTML =
    TEST_SUMMARY_ITEMS.map(key => `<li>${t[key] || key}</li>`).join('');

  const locale = currentLang === 'PT' ? 'pt-BR' : 'en-US';
  document.getElementById('generatedAt').textContent =
    `${t.updatedAt || 'Atualizado em:'} ${new Date().toLocaleString(locale)}`;
}

document.addEventListener('DOMContentLoaded', renderSummaryTab);
