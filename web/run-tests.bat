@echo off
cd /d d:\github-projects\tester.com
npm install --save-dev vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/coverage-v8 @faker-js/faker
npm run test
pause
