param(
  [Parameter(Position = 0)]
  [string]$InputPath,
  [switch]$NoPause
)

$ErrorActionPreference = 'Stop'
$project = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$publicUrl = 'https://luke-jb-atelier.github.io/virtual-gallery-prototype/'
$worktree = Join-Path $env:TEMP ("TipCoreGalleryPublish-" + $PID)
$nodeModulesLink = Join-Path $worktree 'node_modules'

function Write-Step([string]$Text) {
  Write-Host ''
  Write-Host "== $Text ==" -ForegroundColor Cyan
}

function Find-Git {
  $knownGit = Join-Path $env:LOCALAPPDATA 'CodexTools\MinGit\cmd\git.exe'
  if (Test-Path -LiteralPath $knownGit -PathType Leaf) { return $knownGit }
  $command = Get-Command git.exe -ErrorAction SilentlyContinue
  if ($command) { return $command.Source }
  throw 'Nenasel jsem git.exe.'
}

function Run-External([string]$FilePath,[string[]]$Arguments) {
  & $FilePath @Arguments
  if ($LASTEXITCODE -ne 0) { throw "Prikaz selhal: $FilePath $($Arguments -join ' ')" }
}

try {
  if (-not $InputPath) {
    throw 'Chybi presna cesta k zivemu exportu z editoru. Publikace uz nepouziva nahodny soubor ze Stazenych.'
  }
  $resolvedInput = (Resolve-Path -LiteralPath $InputPath).Path
  $git = Find-Git

  Write-Step 'Kontroluji kompletni stav editoru'
  Run-External 'node.exe' @((Join-Path $PSScriptRoot 'validate-gallery-state.mjs'),$resolvedInput)

  Write-Step 'Pripravuji cistou kopii aktualniho GitHubu'
  Set-Location -LiteralPath $project
  Run-External $git @('fetch','origin','main')
  Run-External $git @('worktree','add','--detach',$worktree,'origin/main')

  $backupRoot = Join-Path $env:LOCALAPPDATA 'TipCore\gallery-publish-backups'
  $backupDir = Join-Path $backupRoot (Get-Date -Format 'yyyyMMdd-HHmmss')
  New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
  Copy-Item -LiteralPath $resolvedInput -Destination (Join-Path $backupDir 'raw-editor-state.json') -Force
  $remoteState = Join-Path $worktree 'src\public-gallery-state.json'
  if (Test-Path -LiteralPath $remoteState) {
    Copy-Item -LiteralPath $remoteState -Destination (Join-Path $backupDir 'previous-public-state.json') -Force
  }

  Write-Step 'Optimalizuji obrazky a textury'
  Run-External 'node.exe' @((Join-Path $PSScriptRoot 'optimize-gallery-state.mjs'),$resolvedInput,$remoteState)
  Run-External 'node.exe' @((Join-Path $PSScriptRoot 'validate-gallery-state.mjs'),$remoteState)

  Write-Step 'Kontroluji webovy build'
  New-Item -ItemType Junction -Path $nodeModulesLink -Target (Join-Path $project 'node_modules') | Out-Null
  Push-Location $worktree
  try { Run-External 'npm.cmd' @('run','build') } finally { Pop-Location }
  Remove-Item -LiteralPath $nodeModulesLink -Force

  Push-Location $worktree
  try {
    $changed = & $git status --short -- 'src/public-gallery-state.json'
    if (-not $changed) {
      Write-Step 'Beze zmen'
      Write-Host 'Webova galerie uz obsahuje stejny stav.'
      exit 0
    }
    Write-Step 'Ukladam pouze stav galerie'
    Run-External $git @('add','--','src/public-gallery-state.json')
    Run-External $git @('commit','-m',("Publish gallery state " + (Get-Date -Format 'yyyy-MM-dd HH:mm')),'--','src/public-gallery-state.json')
    Write-Step 'Posilam na GitHub'
    Run-External $git @('push','origin','HEAD:main')
  } finally { Pop-Location }

  Write-Step 'Hotovo'
  Write-Host "Publikovano: $publicUrl"
  Write-Host "Zaloha: $backupDir"
} catch {
  Write-Host ''
  Write-Host 'Publikovani se nepovedlo:' -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
  exit 1
} finally {
  try {
    if (Test-Path -LiteralPath $nodeModulesLink) { Remove-Item -LiteralPath $nodeModulesLink -Force }
    Set-Location -LiteralPath $project
    if (Test-Path -LiteralPath $worktree) { & $git worktree remove --force $worktree | Out-Null }
    if ($git) { & $git worktree prune | Out-Null }
  } catch {}
  if (-not $NoPause) {
    Write-Host ''
    Read-Host 'Stiskni Enter pro zavreni okna'
  }
}
