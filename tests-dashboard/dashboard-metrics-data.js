window.DASHBOARD_METRICS_FALLBACK = {
  "generatedAt": "2026-04-25T13:22:00.000Z",
  "source": "automated-efficiency-integration",
  "unit": {
    "web": {
      "tests": 171,
      "failures": 0,
      "errors": 0,
      "skipped": 0,
      "passed": 171,
      "status": "passed",
      "coverage": {
        "statements": { "percent": 84.5, "covered": 969, "total": 1147 },
        "lines": { "percent": 86.2, "covered": 873, "total": 1013 },
        "functions": { "percent": 80.1, "covered": 153, "total": 191 },
        "branches": { "percent": 74.5, "covered": 217, "total": 291 }
      }
    },
    "backend": {
      "tests": 47,
      "failures": 0,
      "errors": 0,
      "skipped": 0,
      "passed": 47,
      "status": "passed"
    },
    "totals": {
      "tests": 218,
      "failures": 0,
      "errors": 0,
      "skipped": 0,
      "passed": 218,
      "status": "passed"
    }
  },
  "e2e": {
    "byProject": {
      "api": {
        "tests": 104,
        "failures": 0,
        "errors": 0,
        "skipped": 0,
        "passed": 104,
        "status": "passed"
      },
      "frontend-chromium": {
        "tests": 188,
        "failures": 2,
        "errors": 0,
        "skipped": 0,
        "passed": 186,
        "status": "failed",
        "flaky": 3
      }
    },
    "totals": {
      "tests": 292,
      "failures": 2,
      "errors": 0,
      "skipped": 0,
      "passed": 290,
      "status": "failed"
    }
  },
  "qaEfficiency": {
    "defectDensity": { "bugs": 8, "kloc": 14.2, "value": 0.56 },
    "automationROI": { "manualHours": 120, "automationHours": 8, "savedHours": 112, "hourlyRate": 60 },
    "flakiness": { "flakyTests": 3, "totalE2E": 292, "value": 1.03 },
    "defectLeakage": { "escapedToProduction": 2, "detectedInQA": 58, "leakageRate": 3.3 },
    "testAutomationCoverage": { "automated": 292, "manual": 45, "coveragePercent": 86.6, "totalTestCases": 337 },
    "mttr": { "meanTimeToRepair": 18.5 }
  }
};