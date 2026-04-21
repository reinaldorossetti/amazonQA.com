# Tests Dashboard

This folder contains a lightweight static dashboard that reads test artifacts (JUnit, coverage, Playwright) and generates per-execution JSON snapshots used by the UI.

Local dev quickstart

1. Start a static server to serve the dashboard files (from repo root):

```bash
python -m http.server 8000
```

2. Start the dashboard API that triggers the generator (from repo root):

```bash
npm run dashboard-api
# or
node ./tests-dashboard/api-server.js
```

3. Open the UI:

- http://localhost:8000/tests-dashboard/metrics.html

What the API does

- POST /api/generate-dashboard
  - Runs the Node generator (`generate-dashboard-metrics.js`) which scans the repository for test artifacts and writes:
    - `tests-dashboard/dashboard-metrics.json`
    - `tests-dashboard/history/<YYYY-MM-DD>.json` (overwrites today's snapshot)
    - `tests-dashboard/history/dates.json` (last 3 dates)
    - `tests-dashboard/history/latest-scan.json` (debug info: discovered paths)
  - Returns the generated JSON (history snapshot or main dashboard JSON).

Notes

- The UI will try to call the API (best-effort) when the page loads; if the server is available it will generate today's snapshot before the page reads `history/dates.json`.
- The generator always overwrites today's snapshot (`<YYYY-MM-DD>.json`) when executed.
- `latest-scan.json` helps debugging CI runs — it contains the list of files and folders the generator discovered.

If you want the API exposed to other machines, change the port via `DASHBOARD_API_PORT` env var or run behind a reverse proxy.
