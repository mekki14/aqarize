$pgData = "C:\Program Files\PostgreSQL\18\data"
$hbaFile = Join-Path $pgData "pg_hba.conf"
$bakFile = Join-Path $pgData "pg_hba.conf.bak"

# Read current content
$content = Get-Content $hbaFile -Raw

# Check if we already modified it
if ($content -match "^#.*MODIFIED BY AQARIZE SETUP") {
    Write-Output "Already modified, skipping"
    exit 0
}

# Backup
Copy-Item $hbaFile $bakFile -Force

# Replace scram-sha-256 with trust for local connections
$newContent = $content -replace "scram-sha-256", "trust"

# Add marker
$newContent = "# MODIFIED BY AQARIZE SETUP - Restored from backup`n" + $newContent

Set-Content $hbaFile $newContent -Encoding UTF8

Write-Output "pg_hba.conf modified to trust auth"
