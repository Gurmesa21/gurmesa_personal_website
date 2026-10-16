$env:PW_PREBUILT = "1"
$env:PW_WORKERS = "1"
$OutputEncoding = [System.Text.Encoding]::UTF8
npx playwright test --reporter=list 2>&1 | Out-File -FilePath "docs/evidence/day15b-7b/06-playwright-2.txt" -Encoding utf8
