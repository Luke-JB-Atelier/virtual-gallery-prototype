param(
  [Parameter(Position = 0)]
  [string]$InputPath,
  [switch]$NoPause
)

$ErrorActionPreference = 'Stop'

$project = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')
$publicStatePath = Join-Path $project 'src\public-gallery-state.json'
$publicUrl = 'https://luke-jb-atelier.github.io/virtual-gallery-prototype/'

function Write-Step {
  param([string]$Text)
  Write-Host ''
  Write-Host "== $Text ==" -ForegroundColor Cyan
}

function Add-ExistingDirectory {
  param(
    [System.Collections.Generic.List[string]]$Directories,
    [string]$Path
  )
  if ($Path -and (Test-Path -LiteralPath $Path -PathType Container) -and -not $Directories.Contains($Path)) {
    [void]$Directories.Add($Path)
  }
}

function Find-LatestGalleryExport {
  if ($InputPath) {
    return (Resolve-Path -LiteralPath $InputPath).Path
  }

  $directories = [System.Collections.Generic.List[string]]::new()
  Add-ExistingDirectory $directories (Join-Path $env:USERPROFILE 'Downloads')
  Add-ExistingDirectory $directories 'E:\Downloads'
  Add-ExistingDirectory $directories 'E:\Stazene'

  if (Test-Path -LiteralPath 'E:\' -PathType Container) {
    Get-ChildItem -LiteralPath 'E:\' -Directory -ErrorAction SilentlyContinue | ForEach-Object {
      Add-ExistingDirectory $directories $_.FullName
    }
  }

  $exports = foreach ($directory in $directories) {
    Get-ChildItem -LiteralPath $directory -Filter 'virtual-gallery-state*.json' -File -ErrorAction SilentlyContinue
  }

  $latest = $exports | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if (-not $latest) {
    throw 'Nenasel jsem zadny virtual-gallery-state*.json ve stazenych souborech.'
  }
  return $latest.FullName
}

function Find-Git {
  $knownGit = Join-Path $env:LOCALAPPDATA 'CodexTools\MinGit\cmd\git.exe'
  if (Test-Path -LiteralPath $knownGit -PathType Leaf) {
    return $knownGit
  }

  $gitCommand = Get-Command git.exe -ErrorAction SilentlyContinue
  if ($gitCommand) {
    return $gitCommand.Source
  }

  throw 'Nenasel jsem git.exe. Otevri to pres Codex, nebo nainstaluj Git.'
}

function Run-External {
  param(
    [string]$FilePath,
    [string[]]$Arguments
  )

  & $FilePath @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Prikaz selhal: $FilePath $($Arguments -join ' ')"
  }
}

try {
  Set-Location -LiteralPath $project

  Write-Step 'Hledam posledni export galerie'
  $exportPath = Find-LatestGalleryExport
  Write-Host "Pouziju: $exportPath"

  Write-Step 'Zmensuji obrazky a pripravuji verejnou verzi'
  Run-External 'node' @('scripts\optimize-gallery-state.mjs', $exportPath, $publicStatePath)

  Write-Step 'Kontroluji build'
  Run-External 'npm.cmd' @('run', 'build')

  $git = Find-Git
  $changed = & $git status --short -- 'src/public-gallery-state.json'
  if (-not $changed) {
    Write-Step 'Beze zmen'
    Write-Host 'Verejna galerie uz odpovida tomuto exportu. Neni co publikovat.'
    exit 0
  }

  Write-Step 'Ukladam zmenu'
  Run-External $git @('add', 'src/public-gallery-state.json')
  $message = "Publish gallery state $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
  Run-External $git @('commit', '-m', $message, '--', 'src/public-gallery-state.json')

  Write-Step 'Posilam na GitHub'
  Run-External $git @('push', 'origin', 'main')

  Write-Step 'Hotovo'
  Write-Host "GitHub Pages zacne verejnou galerii publikovat automaticky."
  Write-Host "Odkaz: $publicUrl"
} catch {
  Write-Host ''
  Write-Host 'Publikovani se nepovedlo:' -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
  exit 1
} finally {
  if (-not $NoPause) {
    Write-Host ''
    Read-Host 'Stiskni Enter pro zavreni okna'
  }
}
