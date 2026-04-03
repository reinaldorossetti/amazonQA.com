@echo off
cd /d d:\github-projects\tester.com
echo Installing dependencies...
call npm install --save-dev vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/coverage-v8 @faker-js/faker sinon 2>&1
echo.
echo Running tests...
call npm run test 2>&1
pause
