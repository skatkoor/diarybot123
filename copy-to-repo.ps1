<content>$sourceDir = "C:\Users\Test\OneDrive\Music\Jupyter\diaryubuchu"
$targetDir = "C:\Users\Test\OneDrive\Documents\GitHub\diaryubuchu"

Write-Host "Copying from: $sourceDir"
Write-Host "Copying to: $targetDir"

# Ensure target directory exists
if (-not (Test-Path $targetDir)) {
    Write-Host "Creating target directory..."
    New-Item -ItemType Directory -Force -Path $targetDir
}

# Copy files
Write-Host "Copying files..."
$excludes = @('node_modules', 'dist', '.bolt', '.git', 'copy-to-repo.ps1')

Get-ChildItem -Path $sourceDir -Recurse -File |
    Where-Object {
        $exclude = $false
        foreach ($pattern in $excludes) {
            if ($_.FullName -like "*\$pattern\*" -or $_.Name -eq $pattern) {
                $exclude = $true
                break
            }
        }
        -not $exclude
    } | ForEach-Object {
        $relativePath = $_.FullName.Substring($sourceDir.Length)
        $targetPath = Join-Path $targetDir $relativePath
        $targetFolder = Split-Path -Parent $targetPath
        
        if (-not (Test-Path $targetFolder)) {
            New-Item -ItemType Directory -Force -Path $targetFolder | Out-Null
        }
        
        Copy-Item -Path $_.FullName -Destination $targetPath -Force
        Write-Host "Copied: $relativePath"
    }

Write-Host "Copy complete!"</content>