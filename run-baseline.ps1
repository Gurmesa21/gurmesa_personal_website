npm run lint > docs\evidence\day15\01-baseline\lint.txt 2>&1
npx tsc --noEmit > docs\evidence\day15\01-baseline\typecheck.txt 2>&1
npm run build > docs\evidence\day15\01-baseline\build.txt 2>&1
npx vitest run --reporter=verbose > docs\evidence\day15\01-baseline\vitest.txt 2>&1
npx playwright test --reporter=list > docs\evidence\day15\01-baseline\playwright-1.txt 2>&1
npx playwright test --reporter=list > docs\evidence\day15\01-baseline\playwright-2.txt 2>&1
npx prisma migrate status > docs\evidence\day15\01-baseline\migrate-status.txt 2>&1
git status > docs\evidence\day15\01-baseline\git-status.txt 2>&1
git log --oneline -20 > docs\evidence\day15\01-baseline\git-log.txt 2>&1
