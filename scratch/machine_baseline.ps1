$os = Get-CimInstance Win32_OperatingSystem
$freeRam = [math]::Round($os.FreePhysicalMemory / 1024 / 1024, 2)
$totalRam = [math]::Round($os.TotalVisibleMemorySize / 1024 / 1024, 2)
Write-Output "Free RAM (GB): $freeRam"
Write-Output "Total RAM (GB): $totalRam"

Write-Output "`n=== Node & Chrome Processes ==="
Get-Process -Name node,chrome -ErrorAction SilentlyContinue | Select-Object Id, ProcessName, WorkingSet64 | Format-Table -AutoSize | Out-String | Write-Output

Write-Output "=== Ports 3000 / 3006 ==="
Get-NetTCPConnection -LocalPort 3000, 3006 -ErrorAction SilentlyContinue | Select-Object LocalAddress, LocalPort, OwningProcess, State | Format-Table -AutoSize | Out-String | Write-Output

Write-Output "=== OneDrive Check ==="
$current = (Get-Location).Path
$oneDrive = $env:OneDrive
Write-Output "Current Path: $current"
Write-Output "OneDrive Env: $oneDrive"
if ($oneDrive -and $current.StartsWith($oneDrive)) {
    Write-Output "Inside OneDrive: True"
} else {
    Write-Output "Inside OneDrive: False"
}

Write-Output "`n=== .next Size ==="
if (Test-Path .next) {
    $nextSize = (Get-ChildItem -Recurse -Force .next -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    $nextSizeMB = [math]::Round($nextSize / 1MB, 2)
    Write-Output ".next size: $nextSizeMB MB"
} else {
    Write-Output ".next does not exist"
}
