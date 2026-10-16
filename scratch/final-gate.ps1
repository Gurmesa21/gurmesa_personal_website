Write-Host "Starting lint..."
npm run lint > scratch/lint.log 2>&1
if ($LASTEXITCODE -ne 0) { Write-Error "Lint failed"; exit 1 }

Write-Host "Starting typecheck..."
npm run typecheck > scratch/typecheck.log 2>&1
if ($LASTEXITCODE -ne 0) { Write-Error "Typecheck failed"; exit 1 }

Write-Host "Starting build..."
$env:APP_ENV="production"
npm run build > scratch/build.log 2>&1
if ($LASTEXITCODE -ne 0) { Write-Error "Build failed"; exit 1 }

Write-Host "Starting vitest..."
$env:APP_ENV="test"
npx vitest run --reporter=verbose > scratch/vitest.log 2>&1
if ($LASTEXITCODE -ne 0) { Write-Error "Vitest failed"; exit 1 }

Write-Host "ALL PASSED"
