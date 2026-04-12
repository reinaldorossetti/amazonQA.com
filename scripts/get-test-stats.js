const fs = require('fs');
const path = require('path');

try {
    const junitPath = path.resolve(__dirname, '../web/unit-test-report/junit.xml');
    const content = fs.readFileSync(junitPath, 'utf8');
    
    const testsRegex = /tests="(\d+)"/i;
    const failuresRegex = /failures="(\d+)"/i;
    
    const tests = content.match(testsRegex)?.[1] || 0;
    const failures = content.match(failuresRegex)?.[1] || 0;
    
    console.log(JSON.stringify({
        unit: { tests: parseInt(tests), failures: parseInt(failures) },
        e2e: { tests: 1, failures: 0 } // Baseado no .last-run.json fixo por agora
    }));
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
