Write-Host "Starting lint..."
npm run lint > docs/evidence/day15b-7b/lint.log 2>&1
Write-Host "Starting typecheck..."
npm run typecheck > docs/evidence/day15b-7b/typecheck.log 2>&1
Write-Host "Starting build..."
npm run build > docs/evidence/day15b-7b/build.log 2>&1
Write-Host "Starting vitest..."
npx vitest run --reporter=verbose > docs/evidence/day15b-7b/vitest.log 2>&1
Write-Host "Starting playwright 1..."
$env:PW_PREBUILT="1"
$env:PW_WORKERS="1"
npx playwright test --reporter=list > docs/evidence/day15b-7b/playwright1.log 2>&1
Write-Host "Starting playwright 2..."
npx playwright test --reporter=list > docs/evidence/day15b-7b/playwright2.log 2>&1
Write-Host "Gate finished."
